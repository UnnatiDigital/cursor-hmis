import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Fingerprint,
  Security,
  CheckCircle,
  Star,
  People,
  HealthAndSafety,
  Speed,
  Support,
  Login,
  ArrowForward,
  Phone,
  Email,
  LocationOn,
  Schedule,
  VerifiedUser,
  CloudSync,
  DataUsage,
  Privacy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const LandingPage = () => {
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationType, setRegistrationType] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { translate } = useLanguage();

  const features = [
    {
      icon: <PersonAdd color="primary" />,
      title: 'Quick Patient Registration',
      description: 'Streamlined registration process with minimal data entry',
    },
    {
      icon: <Fingerprint color="primary" />,
      title: 'Biometric Integration',
      description: 'Advanced fingerprint and facial recognition for secure identification',
    },
    {
      icon: <Search color="primary" />,
      title: 'Smart Patient Search',
      description: 'Multiple search methods including UHID, ABHA, and biometric',
    },
    {
      icon: <Security color="primary" />,
      title: 'Data Security',
      description: 'HIPAA compliant with end-to-end encryption',
    },
    {
      icon: <People color="primary" />,
      title: 'Family Management',
      description: 'Comprehensive family relationship tracking',
    },
    {
      icon: <HealthAndSafety color="primary" />,
      title: 'Emergency Mode',
      description: 'Rapid registration for emergency situations',
    },
  ];

  const stats = [
    { label: 'Patients Registered', value: '50,000+', icon: <People /> },
    { label: 'Hospitals Connected', value: '500+', icon: <HealthAndSafety /> },
    { label: 'Data Accuracy', value: '99.9%', icon: <CheckCircle /> },
    { label: 'Response Time', value: '<2s', icon: <Speed /> },
  ];

  const handleQuickRegistration = (type) => {
    setRegistrationType(type);
    setShowRegistrationDialog(true);
  };

  const handleRegistrationSubmit = async (formData) => {
    setIsLoading(true);
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      setShowRegistrationDialog(false);
      // Navigate to enhanced registration with pre-filled data
      navigate('/app/patient/registration/enhanced', { 
        state: { 
          quickRegistration: true,
          registrationType,
          formData 
        } 
      });
    }, 2000);
  };

  const QuickRegistrationDialog = () => (
    <Dialog 
      open={showRegistrationDialog} 
      onClose={() => setShowRegistrationDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd color="primary" />
          Quick Patient Registration
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a quick registration. You can provide additional details later.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              required
              margin="normal"
              type="tel"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select label="Gender">
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Registration Type</InputLabel>
              <Select 
                value={registrationType}
                onChange={(e) => setRegistrationType(e.target.value)}
                label="Registration Type"
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="walkin">Walk-in</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRegistrationDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={() => handleRegistrationSubmit({})}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAdd />}
        >
          {isLoading ? 'Processing...' : 'Continue Registration'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                HMIS Patient Module
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                Advanced Healthcare Management Information System
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Streamline patient registration, management, and care coordination with our comprehensive HMIS solution. 
                Built for healthcare professionals, designed for patient safety.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => handleQuickRegistration('standard')}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  Register Patient
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Login />}
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Staff Login
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <HealthAndSafety sx={{ fontSize: 200, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Actions Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="h6" textAlign="center" color="textSecondary" sx={{ mb: 6 }}>
          Choose your preferred registration method
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
              onClick={() => handleQuickRegistration('standard')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  <PersonAdd sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  Standard Registration
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Complete patient registration with all required information
                </Typography>
                <Chip label="Recommended" color="primary" />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
              onClick={() => handleQuickRegistration('emergency')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar sx={{ bgcolor: 'error.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  <HealthAndSafety sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  Emergency Registration
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Rapid registration for emergency situations
                </Typography>
                <Chip label="Priority" color="error" />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
              onClick={() => navigate('/auth')}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  <Login sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom>
                  Staff Access
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Login for healthcare staff and administrators
                </Typography>
                <Chip label="Secure" color="secondary" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Key Features
          </Typography>
          <Typography variant="h6" textAlign="center" color="textSecondary" sx={{ mb: 6 }}>
            Comprehensive patient management capabilities
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" component="h3">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          System Statistics
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                HMIS Patient Module
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Advanced healthcare management information system designed for modern healthcare facilities.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Support
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 30 }}>
                    <Phone fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="+1 (555) 123-4567" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 30 }}>
                    <Email fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="support@hmis.com" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 30 }}>
                    <PersonAdd fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Patient Registration" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleQuickRegistration('standard')}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 30 }}>
                    <Login fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Staff Login" 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/auth')}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2024 HMIS Patient Module. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label="HIPAA Compliant" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Chip label="ISO 27001" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Chip label="GDPR Ready" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          </Box>
        </Container>
      </Box>

      <QuickRegistrationDialog />
    </Box>
  );
};

export default LandingPage; 