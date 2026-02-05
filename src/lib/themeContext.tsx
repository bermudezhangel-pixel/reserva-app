"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'colorful';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Cargar tema guardado
    const saved = localStorage.getItem('app-theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <div className={
        theme === 'dark' ? 'bg-slate-900 text-white min-h-screen transition-colors duration-500' :
        theme === 'colorful' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white min-h-screen transition-colors duration-500' :
        'bg-slate-50 text-slate-900 min-h-screen transition-colors duration-500'
      }>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);