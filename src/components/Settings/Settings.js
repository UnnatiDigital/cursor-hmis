import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Language,
  Notifications,
  Security,
  Storage,
  Backup,
  Update,
  Palette,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const Settings = () => {
  const { 
    translate, 
    currentLanguage, 
    availableLanguages, 
    setLanguage,
    dateFormat,
    numberFormat,
    currency 
  } = useLanguage();

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        {translate('settings.title', 'Settings')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Language and Localization Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Language color="primary" />
                {translate('settings.language', 'Language & Localization')}
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  label="Language"
                >
                  {availableLanguages.map((language) => (
                    <MenuItem key={language.code} value={language.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                        {currentLanguage === language.code && (
                          <Chip label="Active" size="small" color="primary" />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Date Format: {dateFormat}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Number Format: {numberFormat}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Currency: {currency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* User Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette color="primary" />
                {translate('settings.preferences', 'User Preferences')}
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.darkMode', 'Dark Mode')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.autoSave', 'Auto Save')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch />}
                label={translate('settings.accessibility', 'Accessibility Mode')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.animations', 'Enable Animations')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications color="primary" />
                {translate('settings.notifications', 'Notifications')}
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.emailNotifications', 'Email Notifications')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.pushNotifications', 'Push Notifications')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch />}
                label={translate('settings.smsNotifications', 'SMS Notifications')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.emergencyAlerts', 'Emergency Alerts')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                {translate('settings.security', 'Security')}
              </Typography>
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.twoFactorAuth', 'Two-Factor Authentication')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.biometricLogin', 'Biometric Login')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch />}
                label={translate('settings.sessionTimeout', 'Session Timeout')}
                sx={{ mb: 1 }}
              />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label={translate('settings.auditLog', 'Audit Logging')}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage color="primary" />
                {translate('settings.dataManagement', 'Data Management')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {translate('settings.backup', 'Backup & Restore')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {translate('settings.backupDescription', 'Automatically backup your data every 24 hours')}
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label={translate('settings.autoBackup', 'Auto Backup')}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    {translate('settings.dataExport', 'Data Export')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {translate('settings.exportDescription', 'Export your data in various formats')}
                  </Typography>
                  <FormControlLabel
                    control={<Switch />}
                    label={translate('settings.allowExport', 'Allow Data Export')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Update color="primary" />
                {translate('settings.systemInfo', 'System Information')}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    {translate('settings.version', 'Version')}
                  </Typography>
                  <Typography variant="body1">1.0.0</Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    {translate('settings.lastUpdate', 'Last Update')}
                  </Typography>
                  <Typography variant="body1">2024-01-15</Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    {translate('settings.database', 'Database')}
                  </Typography>
                  <Typography variant="body1">PostgreSQL 14</Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    {translate('settings.status', 'Status')}
                  </Typography>
                  <Chip label="Online" color="success" size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 