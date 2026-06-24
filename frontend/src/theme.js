import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6c63ff',
      dark: '#5a52e0',
      light: '#8b83ff',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0ea5e9'
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: {
      default: '#f4f5fb',
      paper: '#ffffff'
    },
    text: {
      primary: '#18181b',
      secondary: '#71717a'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", Inter, sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.05)'
        }
      }
    }
  }
})

export default theme
