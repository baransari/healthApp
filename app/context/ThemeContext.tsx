import * as React from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme';
// Removing the direct import of MD3Theme, using ExtendedMD3Theme from our types file
import type { ThemeContextType, ThemeMode, ExtendedMD3Theme } from '../types';

// Tema event emitter
export const themeEvents = {
  darkModeListeners: [] as ((isDark: boolean) => void)[],
  registerDarkModeListener(callback: (isDark: boolean) => void) {
    this.darkModeListeners.push(callback);
  },
  emitDarkModeChange(isDark: boolean) {
    this.darkModeListeners.forEach(listener => listener(isDark));
  },
};

// Create initial context with proper theme types
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme as unknown as ExtendedMD3Theme,
  themeMode: 'system',
  setTheme: async () => {},
});

export { ThemeMode };

export const ThemeProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const initialLoadDone = useRef(false);

  // Tema tercihlerini depolama ve yükleme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeMode(savedTheme as ThemeMode);
          
          // Dark mode durumunu güncelle
          if (savedTheme === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
          } else {
            setIsDarkMode(savedTheme === 'dark');
          }
        }
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Tema yükleme hatası:', error);
        initialLoadDone.current = true;
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  // Sistem teması değiştiğinde ve mod "system" ise temayı güncelle
  useEffect(() => {
    if (themeMode === 'system' && initialLoadDone.current) {
      setIsDarkMode(systemColorScheme === 'dark');
      themeEvents.emitDarkModeChange(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const toggleTheme = async () => {
    try {
      // Döngüsel tema değişimi: light -> dark -> system -> light
      let newMode: ThemeMode;
      if (themeMode === 'light') {
        newMode = 'dark';
        setIsDarkMode(true);
      } else if (themeMode === 'dark') {
        newMode = 'system';
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        newMode = 'light';
        setIsDarkMode(false);
      }

      setThemeMode(newMode);
      await AsyncStorage.setItem('@theme_mode', newMode);
      themeEvents.emitDarkModeChange(
        newMode === 'dark' || (newMode === 'system' && systemColorScheme === 'dark')
      );
    } catch (error) {
      console.error('Tema kaydetme hatası:', error);
    }
  };

  // Belirli bir temaya geçiş için ek fonksiyon
  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      
      // Dark mode durumunu güncelle
      if (mode === 'system') {
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        setIsDarkMode(mode === 'dark');
      }
      
      await AsyncStorage.setItem('@theme_mode', mode);
      themeEvents.emitDarkModeChange(
        mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark')
      );
    } catch (error) {
      console.error('Tema kaydetme hatası:', error);
    }
  };

  // Doğru theme tipini sağlamak için "as unknown as ExtendedMD3Theme" kullanıyoruz
  const theme = isDarkMode ? darkTheme : lightTheme;
  const contextValue = { 
    isDarkMode, 
    toggleTheme, 
    theme: theme as unknown as ExtendedMD3Theme,
    themeMode,
    setTheme
  };

  // Theme değişikliğinde React Native'e bildir
  useEffect(() => {
    if (isDarkMode) {
      themeEvents.emitDarkModeChange(true);
    } else {
      themeEvents.emitDarkModeChange(false);
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme, ThemeProvider içinde kullanılmalıdır');
  }
  return context;
};
