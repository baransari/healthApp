/**
 * Navigation types for the application
 */
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth stack screens
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main tab navigation screens
export type MainTabParamList = {
  Home: undefined;
  WaterTracker: undefined;
  CalorieTracker: undefined;
  FoodTracker: undefined;
  ExerciseTracker: undefined;
  StepTracker: undefined;
  SleepTracker: undefined;
  Profile: undefined;
};

// Root stack navigator screens
export type RootStackParamList = {
  // Splash ve Auth ekranları
  SplashScreen: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Ana tab navigator
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  
  // Egzersiz ekranları
  ExerciseDetails: { exerciseId: string };
  AddWorkout: undefined;
  
  // Profil ekranları
  EditProfile: { userId?: string };
  
  // Ayarlar ekranları
  Settings: undefined;
  NotificationsSettings: undefined;
  GoalSettings: undefined;
  ThemeSettings: undefined;
  
  // Beslenme ekranları
  NutritionGoals: undefined;
  FoodDetails: { foodId: string };
  AddFood: { mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' };
  
  // Diğer tracker ekranları
  SleepDetails: { sleepId?: string };
  WaterSettings: undefined;
};

// Tüm navigasyon parametreleri için genel tip
export type NavigationParams = RootStackParamList & MainTabParamList;
