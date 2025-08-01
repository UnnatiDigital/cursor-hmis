import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  Container,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Fingerprint,
  Phone,
  Email,
  Security,
  Login,
  Refresh,
  Warning,
  CheckCircle,
  PersonAdd,
  HealthAndSafety,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Authentication = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0: Login, 1: Patient Registration
  const [authMethod, setAuthMethod] = useState('password'); // 'password', 'otp', 'biometric'
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: '',
    mobile: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('ready'); // 'ready', 'capturing', 'success', 'error'

  const { login, loginWithOTP, loginWithBiometric, sendOTP, isLockedOut, biometricEnrolled } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(credentials, 'password');
      if (success) {
        navigate('/app/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!credentials.mobile) {
      setError('Please enter your mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await sendOTP(credentials.mobile);
      if (success) {
        setOtpSent(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    if (!credentials.otp) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await loginWithOTP(credentials.mobile, credentials.otp);
      if (success) {
        navigate('/app/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricStatus('capturing');
    setError('');

    try {
      // Simulate biometric capture
      const biometricData = {
        quality: Math.random() * 40 + 60, // 60-100 range
        type: 'fingerprint',
        data: 'mock_biometric_data',
      };

      const success = await loginWithBiometric(biometricData);
      if (success) {
        setBiometricStatus('success');
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 1000);
      } else {
        setBiometricStatus('error');
        setError('Biometric authentication failed');
      }
    } catch (error) {
      setBiometricStatus('error');
      setError(error.message);
    }
  };

  const renderPasswordLogin = () => (
    <Box component="form" onSubmit={handlePasswordLogin}>
      <TextField
        fullWidth
        label="Username or Email"
        value={credentials.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={credentials.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        margin="normal"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading || isLockedOut()}
        startIcon={isLoading ? <CircularProgress size={20} /> : <Login />}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );

  const renderOTPLogin = () => (
    <Box component="form" onSubmit={handleOTPLogin}>
      <TextField
        fullWidth
        label="Mobile Number"
        value={credentials.mobile}
        onChange={(e) => handleInputChange('mobile', e.target.value)}
        margin="normal"
        required
        placeholder="Enter 10-digit mobile number"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone />
            </InputAdornment>
          ),
        }}
      />
      
      {!otpSent ? (
        <Button
          fullWidth
          variant="outlined"
          onClick={handleSendOTP}
          disabled={isLoading || !credentials.mobile}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Phone />}
          sx={{ mt: 2, mb: 2 }}
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            label="OTP"
            value={credentials.otp}
            onChange={(e) => handleInputChange('otp', e.target.value)}
            margin="normal"
            required
            placeholder="Enter 6-digit OTP"
            inputProps={{ maxLength: 6 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading || !credentials.otp}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{ mt: 2, mb: 2 }}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setOtpSent(false)}
            startIcon={<Refresh />}
          >
            Resend OTP
          </Button>
        </>
      )}
    </Box>
  );

  const renderBiometricLogin = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ mb: 3 }}>
        <Fingerprint sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Biometric Authentication
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {biometricEnrolled 
            ? 'Place your finger on the scanner to login'
            : 'Biometric enrollment required. Please contact administrator.'
          }
        </Typography>
      </Box>

      {biometricStatus === 'ready' && (
        <Button
          fullWidth
          variant="contained"
          onClick={handleBiometricLogin}
          disabled={!biometricEnrolled}
          startIcon={<Fingerprint />}
          sx={{ mb: 2 }}
        >
          Login with Biometric
        </Button>
      )}

      {biometricStatus === 'capturing' && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Capturing Biometric...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we verify your identity
          </Typography>
        </Box>
      )}

      {biometricStatus === 'success' && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" color="success.main">
            Authentication Successful!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {biometricStatus === 'error' && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Warning sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="error.main">
            Authentication Failed
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setBiometricStatus('ready')}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'password':
        return renderPasswordLogin();
      case 'otp':
        return renderOTPLogin();
      case 'biometric':
        return renderBiometricLogin();
      default:
        return renderPasswordLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                HMIS Patient Module
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Healthcare Management Information System
              </Typography>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={currentTab} 
                onChange={(e, newValue) => setCurrentTab(newValue)}
                centered
                sx={{ mb: 2 }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Login />
                      Staff Login
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonAdd />
                      Patient Registration
                    </Box>
                  } 
                />
              </Tabs>
            </Box>

          {/* Tab Content */}
          {currentTab === 0 && (
            <>
              {/* Authentication Method Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Choose Login Method
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant={authMethod === 'password' ? 'contained' : 'outlined'}
                      onClick={() => setAuthMethod('password')}
                      startIcon={<Lock />}
                      size="small"
                    >
                      Password
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant={authMethod === 'otp' ? 'contained' : 'outlined'}
                      onClick={() => setAuthMethod('otp')}
                      startIcon={<Phone />}
                      size="small"
                    >
                      OTP
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant={authMethod === 'biometric' ? 'contained' : 'outlined'}
                      onClick={() => setAuthMethod('biometric')}
                      startIcon={<Fingerprint />}
                      size="small"
                      disabled={!biometricEnrolled}
                    >
                      Biometric
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Lockout Warning */}
              {isLockedOut() && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Account temporarily locked due to multiple failed attempts. 
                  Please try again later.
                </Alert>
              )}

              {/* Authentication Form */}
              {renderAuthMethod()}

              {/* Demo Credentials */}
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Demo Credentials:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Username: admin | Password: admin123
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Mobile: 9876543210 | OTP: 123456
                </Typography>
              </Paper>
            </>
          )}

          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Patient Registration Options
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      }
                    }}
                    onClick={() => navigate('/app/patient/registration/enhanced')}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Standard Registration
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Complete patient registration with all required information
                      </Typography>
                      <Chip label="Recommended" color="primary" />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      }
                    }}
                    onClick={() => navigate('/app/patient/registration/enhanced', { 
                      state: { registrationType: 'emergency' } 
                    })}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <HealthAndSafety sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Emergency Registration
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Rapid registration for emergency situations
                      </Typography>
                      <Chip label="Priority" color="error" />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Need help? Contact our support team
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Phone />}
                  onClick={() => window.open('tel:+15551234567')}
                >
                  Call Support
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
    </Box>
  );
};

export default Authentication; 