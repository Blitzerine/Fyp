/**
 * Chart Theme Utility
 * Provides theme-aware colors for Plotly charts
 */

export const getChartTheme = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  // Helper to get CSS variable with fallback
  const getVar = (name, fallback) => {
    const value = computedStyle.getPropertyValue(name).trim();
    return value || fallback;
  };

  const isBright = root.classList.contains('theme-bright');

  if (isBright) {
    return {
      paperBg: getVar('--page-bg', '#D9F3FF'), // Sky middle
      plotBg: getVar('--surface', 'rgba(255, 255, 255, 0.72)'), // Frosted glass
      fontColor: getVar('--text', 'rgba(11, 31, 42, 0.78)'), // Dark readable
      gridColor: getVar('--border', 'rgba(0, 0, 0, 0.08)'), // Light gray grid
      accentColor: getVar('--accent', '#0B3D2E'),
      mutedColor: getVar('--muted', 'rgba(11, 31, 42, 0.60)'),
      legendBg: getVar('--surface', 'rgba(255, 255, 255, 0.72)'), // Frosted glass
      legendBorder: getVar('--border', 'rgba(0, 0, 0, 0.08)'),
      tooltipBg: getVar('--surface-2', 'rgba(255, 255, 255, 0.95)'), // White-ish tooltip
      tooltipText: getVar('--text', 'rgba(11, 31, 42, 0.78)'), // Dark text
      tooltipBorder: getVar('--border', 'rgba(0, 0, 0, 0.08)'),
      // Chart series colors (readable in bright mode)
      seriesColors: {
        primary: getVar('--accent-primary', '#0B3D2E'),      // Dark green
        secondary: '#10b981',     // Medium green
        tertiary: '#14b8a6',      // Teal
        accent: getVar('--accent-primary', '#0B3D2E'),        // Dark green
        success: '#10b981',       // Emerald
        warning: '#d97706',       // Orange
        danger: '#dc2626'         // Red
      }
    };
  } else {
    return {
      paperBg: getVar('--page-bg', '#070A08'),
      plotBg: getVar('--surface', '#0D1411'),
      fontColor: getVar('--text', '#EAF4EE'),
      gridColor: getVar('--border', 'rgba(70, 255, 160, 0.15)'),
      accentColor: getVar('--accent', '#46FFA0'),
      mutedColor: getVar('--muted', 'rgba(234, 244, 238, 0.75)'),
      legendBg: getVar('--surface', '#0D1411'),
      legendBorder: getVar('--border', 'rgba(70, 255, 160, 0.15)'),
      tooltipBg: getVar('--surface-2', '#111A16'),
      tooltipText: getVar('--text', '#EAF4EE'),
      tooltipBorder: getVar('--border', 'rgba(70, 255, 160, 0.15)'),
      // Chart series colors (readable in dark mode)
      seriesColors: {
        primary: getVar('--accent-primary', '#46FFA0'),       // Bright green
        secondary: '#00FF6F',     // Neon green
        tertiary: '#01D6DF',      // Cyan
        accent: '#60a5fa',        // Blue
        success: '#00D9A3',       // Teal
        warning: '#fbbf24',       // Yellow
        danger: '#ef4444'         // Red
      }
    };
  }
};

