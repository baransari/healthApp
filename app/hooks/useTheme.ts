import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import type { ThemeContextType } from '../types';

/**
 * useTheme hook - ThemeContext'ten gelen temayı ve tema yönetim fonksiyonlarını kullanır
 * 
 * Bu hook, eski kodlarla uyumluluk için tutulmuştur ancak tam işlevsellik sunar.
 * İçeriğinde şunlar vardır:
 * - theme: Aktif tema nesnesi (MD3Theme)
 * - isDarkMode: Temanın karanlık mod olup olmadığı
 * - themeMode: Tema modu (light, dark, system)
 * - setTheme: Tema modunu değiştirme fonksiyonu
 * - toggleTheme: Temalar arasında geçiş yapma fonksiyonu
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme hooks/useTheme.ts içinde kullanılırken hata: ThemeContext içinde kullanılmalıdır');
  }
  return context;
};

export default useTheme;
