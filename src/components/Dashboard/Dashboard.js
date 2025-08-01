import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import {
  PersonAdd,
  Search,
  People,
  Fingerprint,
  TrendingUp,
  TrendingDown,
  Notifications,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Info,
  Add,
  ViewList,
  Assessment,
  Security,
  Language,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    newRegistrations: 0,
    pendingBiometrics: 0,
    activeFamilies: 0,
    emergencyRegistrations: 0,
    duplicateAlerts: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [quickActions] = useState([
    {
      title: 'Register New Patient',
      description: 'Add a new patient to the system',
      icon: <PersonAdd />,
      path: '/patient/registration',
      color: 'primary',
      permission: 'patient:create',
    },
    {
      title: 'Search Patients',
      description: 'Find existing patient records',
      icon: <Search />,
      path: '/patient/search',
      color: 'secondary',
      permission: 'patient:read',
    },
    {
      title: 'Family Management',
      description: 'Manage family relationships',
      icon: <People />,
      path: '/family',
      color: 'success',
      permission: 'family:manage',
    },
    {
      title: 'Biometric Capture',
      description: 'Capture biometric data',
      icon: <Fingerprint />,
      path: '/biometric',
      color: 'warning',
      permission: 'biometric:access',
    },
  ]);

  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { patients, families, auditTrail } = usePatient();
  const { translate } = useLanguage();

  useEffect(() => {
    // Calculate dashboard statistics
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const newRegistrations = patients.filter(patient => 
      new Date(patient.registrationDate) >= todayStart
    ).length;
    
    const emergencyRegistrations = patients.filter(patient => 
      patient.registrationMode === 'emergency' && 
      new Date(patient.registrationDate) >= todayStart
    ).length;
    
    const pendingBiometrics = patients.filter(patient => 
      !patient.biometricData || patient.biometricData.fingerprints.length === 0
    ).length;
    
    const duplicateAlerts = auditTrail.filter(entry => 
      entry.action === 'DUPLICATE_CHECK' && 
      new Date(entry.timestamp) >= todayStart
    ).length;

    setStats({
      totalPatients: patients.length,
      newRegistrations,
      pendingBiometrics,
      activeFamilies: families.length,
      emergencyRegistrations,
      duplicateAlerts,
    });

    // Get recent activities
    const recent = auditTrail
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
    
    setRecentActivities(recent);
  }, [patients, families, auditTrail]);

  const getActivityIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <PersonAdd color="success" />;
      case 'UPDATE':
        return <CheckCircle color="primary" />;
      case 'BIOMETRIC_CAPTURE':
        return <Fingerprint color="warning" />;
      case 'DUPLICATE_CHECK':
        return <Warning color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'primary';
      case 'BIOMETRIC_CAPTURE':
        return 'warning';
      case 'DUPLICATE_CHECK':
        return 'error';
      default:
        return 'info';
    }
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend > 0 ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {Math.abs(trend)}% from yesterday
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ action }) => {
    if (action.permission && !hasPermission(action.permission)) {
      return null;
    }

    return (
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => navigate(action.path)}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar
            sx={{
              bgcolor: `${action.color}.main`,
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
            }}
          >
            {action.icon}
          </Avatar>
          <Typography variant="h6" component="div" gutterBottom>
            {action.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {action.description}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening in your patient management system today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<People />}
            color="primary"
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Registrations"
            value={stats.newRegistrations}
            icon={<PersonAdd />}
            color="success"
            trend={12.5}
            subtitle="Today"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Biometrics"
            value={stats.pendingBiometrics}
            icon={<Fingerprint />}
            color="warning"
            trend={-8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Families"
            value={stats.activeFamilies}
            icon={<People />}
            color="info"
            trend={3.1}
          />
        </Grid>
      </Grid>

      {/* Emergency and Alerts Section */}
      {(stats.emergencyRegistrations > 0 || stats.duplicateAlerts > 0) && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'warning.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning color="warning" />
            <Typography variant="h6" color="warning.dark">
              Alerts & Notifications
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            {stats.emergencyRegistrations > 0 && (
              <Chip
                label={`${stats.emergencyRegistrations} Emergency Registrations Today`}
                color="error"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
            {stats.duplicateAlerts > 0 && (
              <Chip
                label={`${stats.duplicateAlerts} Duplicate Alerts`}
                color="warning"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Quick Actions */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <QuickActionCard action={action} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities and System Status */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  Recent Activities
                </Typography>
                <Button
                  size="small"
                  endIcon={<ViewList />}
                  onClick={() => navigate('/audit')}
                >
                  View All
                </Button>
              </Box>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <ListItem key={activity.id || index} divider>
                      <ListItemIcon>
                        {getActivityIcon(activity.action)}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                            {activity.changes && (
                              <Typography variant="body2" color="textSecondary">
                                {activity.changes.type || 'System activity'}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Chip
                        label={activity.action}
                        size="small"
                        color={getActivityColor(activity.action)}
                        variant="outlined"
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      secondary="Activities will appear here as you use the system"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                System Status
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Biometric Devices</Typography>
                  <Chip label="Online" size="small" color="success" />
                </Box>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database Health</Typography>
                  <Chip label="Healthy" size="small" color="success" />
                </Box>
                <LinearProgress variant="determinate" value={95} sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Translation Service</Typography>
                  <Chip label="Active" size="small" color="success" />
                </Box>
                <LinearProgress variant="determinate" value={90} sx={{ mb: 2 }} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Last System Check
              </Typography>
              <Typography variant="body2">
                {new Date().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 