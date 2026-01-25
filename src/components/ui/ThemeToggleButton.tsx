'use client';

import React from 'react';
import { useTheme } from '@/hooks/ui/useTheme';

interface ThemeToggleButtonProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Theme toggle button component
 * Provides a simple button to toggle between light and dark themes
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  className = '',
  showLabel = false,
}) => {
  // Dark-only mode: don't render a toggle UI.
  // (Keeping the component avoids having to touch call sites.)
  useTheme();
  void className;
  void showLabel;

  return null;
};

