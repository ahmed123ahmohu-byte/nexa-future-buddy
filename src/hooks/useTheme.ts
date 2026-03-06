import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('nexa-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('nexa-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.body.style.background = theme === 'dark' ? 'hsl(240, 15%, 5%)' : 'hsl(0, 0%, 98%)';
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}
