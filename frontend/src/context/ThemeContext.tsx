import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColor {
  id: string;
  name: string;
  hex: string;
  hover: string;
  subtle: string;
}

export const PRESET_THEMES: ThemeColor[] = [
  {
    id: 'orange',
    name: 'Safety Orange (Default)',
    hex: '#ff4a1f',
    hover: '#ff623b',
    subtle: 'rgba(255, 74, 31, 0.15)',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    hover: '#22d3ee',
    subtle: 'rgba(6, 182, 212, 0.15)',
  },
  {
    id: 'emerald',
    name: 'Signal Emerald',
    hex: '#10b981',
    hover: '#34d399',
    subtle: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'cobalt',
    name: 'Signal Cobalt',
    hex: '#2563eb',
    hover: '#3b82f6',
    subtle: 'rgba(37, 99, 235, 0.15)',
  },
  {
    id: 'crimson',
    name: 'Carmine Crimson',
    hex: '#ef4444',
    hover: '#f87171',
    subtle: 'rgba(239, 68, 68, 0.15)',
  },
  {
    id: 'amber',
    name: 'Industrial Amber',
    hex: '#f59e0b',
    hover: '#fbbf24',
    subtle: 'rgba(245, 158, 11, 0.15)',
  },
];

interface ThemeContextType {
  currentColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  setCustomHex: (hex: string) => void;
  resetToDefault: () => void;
  presets: ThemeColor[];
}

const STORAGE_KEY = 'teamsync_theme_accent';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentColor, setCurrentColor] = useState<ThemeColor>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return PRESET_THEMES[0]; // Safety orange default
  });

  const applyColorToDom = (color: ThemeColor) => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', color.hex);
    root.style.setProperty('--color-accent-hover', color.hover);
    root.style.setProperty('--color-accent-subtle', color.subtle);
  };

  useEffect(() => {
    applyColorToDom(currentColor);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentColor));
    } catch {
      // ignore
    }
  }, [currentColor]);

  const setThemeColor = (color: ThemeColor) => {
    setCurrentColor(color);
  };

  const setCustomHex = (hex: string) => {
    const validHex = hex.startsWith('#') ? hex : `#${hex}`;
    const custom: ThemeColor = {
      id: 'custom',
      name: `Custom (${validHex})`,
      hex: validHex,
      hover: validHex,
      subtle: `${validHex}26`,
    };
    setCurrentColor(custom);
  };

  const resetToDefault = () => {
    setCurrentColor(PRESET_THEMES[0]);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentColor,
        setThemeColor,
        setCustomHex,
        resetToDefault,
        presets: PRESET_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
