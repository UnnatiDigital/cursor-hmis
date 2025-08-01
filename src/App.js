import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Layout from './components/Layout/Layout';
import LandingPage from './components/LandingPage/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import PatientRegistration from './components/PatientRegistration/PatientRegistration';
import PatientSearch from './components/PatientSearch/PatientSearch';
import PatientProfile from './components/PatientProfile/PatientProfile';
import FamilyManagement from './components/FamilyManagement/FamilyManagement';
import BiometricManagement from './components/BiometricManagement/BiometricManagement';
import Authentication from './components/Authentication/Authentication';
import Settings from './components/Settings/Settings';
import EnhancedPatientRegistration from './components/EnhancedPatientRegistration/EnhancedPatientRegistration';

// Import context providers
import { AuthProvider } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import { BiometricProvider } from './contexts/BiometricContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <PatientProvider>
            <BiometricProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Authentication />} />
                  
                  {/* Protected routes with Layout */}
                  <Route path="/app/*" element={
                    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/patient/registration" element={<PatientRegistration />} />
                          <Route path="/patient/registration/enhanced" element={<EnhancedPatientRegistration />} />
                          <Route path="/patient/search" element={<PatientSearch />} />
                          <Route path="/patient/profile/:id" element={<PatientProfile />} />
                          <Route path="/family" element={<FamilyManagement />} />
                          <Route path="/biometric" element={<BiometricManagement />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Layout>
                    </Box>
                  } />
                </Routes>
              </Router>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </BiometricProvider>
          </PatientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
