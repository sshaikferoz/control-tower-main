'use client';
import React, { useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Dark-only mode: don't render a toggle UI.
  void className;
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
  }, []);

  return null;
};
