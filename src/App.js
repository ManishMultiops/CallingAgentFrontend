import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import DataManagement from './components/DataManagement';
import Callbacks from './components/Callbacks';
import Settings from './components/Settings';
import Demos from './components/Demos';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import Layout from './components/Layout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#18181b', // Very dark grey, almost black
      paper: '#27272a',   // Deep grey for cards/surfaces
    },
    primary: {
      main: '#4ade80', // Bright green accent
    },
    secondary: {
      main: '#10b981', // Emerald green
    },
    text: {
      primary: '#ffffff', // White
      secondary: '#a1a1aa', // Light grey (zinc-400)
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(74, 222, 128, 0.1)',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 4px 6px rgba(74, 222, 128, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: 12,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: 16,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#18181b',
          }
        }
      }
    }
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    primary: {
      main: '#2563eb', // Tech blue for light theme
    },
    secondary: {
      main: '#10b981', // Emerald green
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#64748b', // Slate 500
    }
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0', // Slate 200 border
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    }
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function ThemeWrapper({ children }) {
  const { mode } = useAppTheme();

  // Decide which theme to apply
  const activeTheme = mode === 'dark' ? darkTheme : lightTheme;

  // Dynamic global scrollbar classes mapped to the current mode
  const globalStyles = {
    '*::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '*::-webkit-scrollbar-track': {
      background: mode === 'dark' ? '#18181b' : '#f1f5f9',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: mode === 'dark' ? '#3f3f46' : '#cbd5e1',
      borderRadius: '4px',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      backgroundColor: mode === 'dark' ? '#52525b' : '#94a3b8',
    },
    body: {
      backgroundColor: activeTheme.palette.background.default,
      color: activeTheme.palette.text.primary,
    }
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <AppThemeProvider>
      <ThemeWrapper>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/data" element={
                <ProtectedRoute>
                  <Layout>
                    <DataManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/callbacks" element={
                <ProtectedRoute>
                  <Layout>
                    <Callbacks />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/demos" element={
                <ProtectedRoute>
                  <Layout>
                    <Demos />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <AdvancedAnalytics />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeWrapper>
    </AppThemeProvider>
  );
}

export default App;