
export const colors = {
  background: {
    primary: '#000000',
    secondary: '#0E0E0E',
    elevated: '#131313',
    card: '#1C1B1B',
    border: '#2A2A2A',
  },

  brand: {
    primary: '#E10600',
    accent: '#FF2A1A',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#C0C0C0',
    muted: '#8A8A8A',
    disabled: '#555555',
  },

  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export type ColorPalette = typeof colors;
