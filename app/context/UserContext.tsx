import * as React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../store';
import { RootState } from '../store';
import { themeEvents } from './ThemeContext';
import { useTheme } from '../hooks/useTheme';
import StorageService from '../services/StorageService';
import { SleepEntry } from '../store/sleepTrackerSlice';
import type { User, UserContextType } from '../types';

// Sleep tracker state type
interface SleepTrackerState {
  entries: SleepEntry[];
  lastSleep: SleepEntry | null;
  sleepGoal: number;
  loading: boolean;
  error: string | null;
  averageDuration: number;
}

interface UserProviderProps {
  children: ReactNode;
}

// Context tipi
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  error: null,
  updateUser: async () => {},
});

// Storage key for user data
const USER_STORAGE_KEY = '@HealthTrackAI:userData';

export const UserProvider: React.FunctionComponent<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  
  // Referans değerleri tutmak için ref kullanımı
  const isListenerSetupRef = useRef(false);
  const prevStateRef = useRef({
    isDarkMode: null as boolean | null,
    user: null as User | null,
  });

  const loadUser = useCallback(async () => {
    try {
      // Öncelikle StorageService ile dene
      const userData = await StorageService.getItem(USER_STORAGE_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } else {
        // Geriye dönük uyumluluk için eski anahtarı kontrol et
        const savedUser = await AsyncStorage.getItem('@user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Eski veriyi yeni formata taşı
          await StorageService.setItem(USER_STORAGE_KEY, savedUser);
          setUser(parsedUser);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Save user data to storage when it changes
  const saveUserData = useCallback(async (userData: User) => {
    try {
      await StorageService.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('[UserProvider] Error saving user data:', error);
    }
  }, []);

  const handleSetUser = useCallback(async (newUser: User) => {
    try {
      const userData = JSON.stringify(newUser);
      await StorageService.setItem(USER_STORAGE_KEY, userData);
      setUser(newUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const handleUpdateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...updates };
      const userData = JSON.stringify(updatedUser);
      await StorageService.setItem(USER_STORAGE_KEY, userData);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user]);

  // Redux state'lerini al
  const waterTracker = useAppSelector((state: RootState) => state.waterTracker);
  const foodTracker = useAppSelector((state: RootState) => state.foodTracker);
  const exerciseTracker = useAppSelector((state: RootState) => state.exerciseTracker);
  const stepTracker = useAppSelector((state: RootState) => state.stepTracker);
  const sleepTracker = useAppSelector((state: RootState) => state.sleepTracker);

  // Bu sefer, Redux'tan bütün güncellemeleri tek bir effect'te toplayalım
  // Bu, daha az render döngüsüne yol açacak
  useEffect(() => {
    if (!user) return; // Kullanıcı yoksa hiçbir şey yapma
    
    // Değişiklikleri takip etmek için bir flag
    let hasChanges = false;
    const updatedUser = { ...user };
    
    // Su takibi güncellemeleri
    if (waterTracker) {
      const totalWaterIntake = waterTracker.entries.reduce((total, entry) => total + entry.amount, 0) / 1000;
      const waterIntakeFormatted = parseFloat(totalWaterIntake.toFixed(1));
      const waterGoalLiters = waterTracker.goal / 1000;
      
      if (user.waterIntake !== waterIntakeFormatted || user.waterGoal !== waterGoalLiters) {
        updatedUser.waterIntake = waterIntakeFormatted;
        updatedUser.waterGoal = waterGoalLiters;
        hasChanges = true;
      }
    }
    
    // Adım takibi güncellemeleri
    if (stepTracker) {
      if (user.steps !== stepTracker.dailySteps || user.stepsGoal !== stepTracker.stepGoal) {
        updatedUser.steps = stepTracker.dailySteps;
        updatedUser.stepsGoal = stepTracker.stepGoal;
        hasChanges = true;
      }
    }
    
    // Uyku takibi güncellemeleri  
    if (sleepTracker) {
      const sleepState = sleepTracker as SleepTrackerState;
      const newSleepHours = sleepState.lastSleep?.duration || user.sleepHours;
      const newSleepGoal = sleepState.sleepGoal || user.sleepGoal;
      
      if (user.sleepHours !== newSleepHours || user.sleepGoal !== newSleepGoal) {
        updatedUser.sleepHours = newSleepHours;
        updatedUser.sleepGoal = newSleepGoal;
        hasChanges = true;
      }
    }
    
    // Kalori ve besin takibi güncellemeleri
    if (foodTracker) {
      const totalCalories = foodTracker.entries?.reduce((total, entry) => total + entry.nutrition.calories, 0) || 0;
      const newCaloriesGoal = foodTracker.goals.calories || user.caloriesGoal;
      
      if (user.calories !== totalCalories || user.caloriesGoal !== newCaloriesGoal) {
        updatedUser.calories = totalCalories;
        updatedUser.caloriesGoal = newCaloriesGoal;
        hasChanges = true;
      }
    }
    
    // Egzersiz takibi güncellemeleri
    if (exerciseTracker) {
      const completedSessions = exerciseTracker.workoutSessions.filter(session => session.completed);
      const newCompletedWorkouts = completedSessions.length;
      const newTotalWorkouts = exerciseTracker.workoutPlans.length;
      
      if (user.completedWorkouts !== newCompletedWorkouts || user.totalWorkouts !== newTotalWorkouts) {
        updatedUser.completedWorkouts = newCompletedWorkouts;
        updatedUser.totalWorkouts = newTotalWorkouts;
        hasChanges = true;
      }
    }
    
    // Eğer değişiklikler varsa kullanıcı bilgisini güncelle
    if (hasChanges) {
      saveUserData(updatedUser);
      setUser(updatedUser);
    }
  }, [user, waterTracker, foodTracker, exerciseTracker, stepTracker, sleepTracker, saveUserData]);

  // Tema değişikliklerini takip et
  useEffect(() => {
    // Tema değiştiğinde UserContext'teki kullanıcı ayarlarını güncelle
    if (user && prevStateRef.current.isDarkMode !== isDarkMode) {
      prevStateRef.current.isDarkMode = isDarkMode;
      
      if (user.darkModeEnabled !== isDarkMode) {
        const updatedUser = {
          ...user,
          darkModeEnabled: isDarkMode,
        };
        
        saveUserData(updatedUser);
        setUser(updatedUser);
      }
    }
  }, [isDarkMode, user, saveUserData]);

  // ThemeContext'ten tema değişikliklerini dinle - sadece bir kez çalışsın
  useEffect(() => {
    if (isListenerSetupRef.current) return;
    
    console.log('[UserProvider] Setting up theme listener');
    
    // ThemeContext'e darkModeListener kaydı yapalım
    const handleDarkModeChange = (isDark: boolean) => {
      console.log('[UserProvider] Dark mode changed via themeEvents:', isDark);
      
      // Sadece kullanıcı varsa ve dark mode değeri değiştiyse güncelle
      setUser(prevUser => {
        if (!prevUser || prevUser.darkModeEnabled === isDark) return prevUser;
        
        const updatedUser = {
          ...prevUser,
          darkModeEnabled: isDark,
        };
        saveUserData(updatedUser);
        return updatedUser;
      });
    };
    
    themeEvents.registerDarkModeListener(handleDarkModeChange);
    isListenerSetupRef.current = true;
  }, [saveUserData]);

  const contextValue: UserContextType = {
    user,
    setUser: handleSetUser,
    loading,
    error,
    updateUser: handleUpdateUser,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
