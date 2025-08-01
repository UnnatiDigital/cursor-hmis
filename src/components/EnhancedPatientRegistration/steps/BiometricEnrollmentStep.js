import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Chip,
  Card,
  CardContent,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Fingerprint,
  CameraAlt,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Security,
  Info,
  Speed,
  Quality,
  Timer,
} from '@mui/icons-material';
import { useBiometric } from '../../../contexts/BiometricContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BiometricCapture from '../../BiometricCapture/BiometricCapture';

const BiometricEnrollmentStep = ({ formData, errors, onFieldChange, isEmergencyMode }) => {
  const { translate, currentLanguage } = useLanguage();
  const {
    captureFingerprint,
    captureFacialImage,
    isDeviceReady,
    currentDevice,
    qualityThreshold,
    emergencyQualityThreshold,
    retryCount,
    maxRetries,
    getCapturedData,
    clearCapturedData,
  } = useBiometric();

  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [captureMode, setCaptureMode] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureStatus, setCaptureStatus] = useState('idle');
  const [biometricConsent, setBiometricConsent] = useState(false);
  // Use formData.biometricData directly instead of local state
  const capturedData = formData.biometricData || {
    fingerprints: [],
    facialImage: null,
    iris: null,
  };
  const [qualityScores, setQualityScores] = useState({});

  // Finger types for capture
  const fingerTypes = [
    { value: 'thumb', label: 'Thumb', icon: '👍', required: true },
    { value: 'index', label: 'Index Finger', icon: '👆', required: false },
    { value: 'middle', label: 'Middle Finger', icon: '🖕', required: false },
    { value: 'ring', label: 'Ring Finger', icon: '💍', required: false },
    { value: 'little', label: 'Little Finger', icon: '🤏', required: false },
  ];

  useEffect(() => {
    // Set consent status
    setBiometricConsent(formData.biometricData?.consentGiven || false);
  }, [formData.biometricData]);

  // Handle biometric consent change
  const handleConsentChange = (event) => {
    const consent = event.target.checked;
    setBiometricConsent(consent);
    onFieldChange('biometricData', {
      ...formData.biometricData,
      consentGiven: consent,
    });
  };

  // Start biometric capture
  const handleCaptureStart = async (mode) => {
    setCaptureMode(mode);
    setCaptureStatus('capturing');
    setCaptureProgress(0);
    setShowBiometricDialog(true);

    try {
      let result;
      if (mode === 'fingerprint') {
        result = await captureFingerprint('thumb');
      } else if (mode === 'facial') {
        result = await captureFacialImage({
          skipLiveness: isEmergencyMode,
          skipICAO: isEmergencyMode,
        });
      }

      if (result.success) {
        setCaptureStatus('success');
        setQualityScores(prev => ({
          ...prev,
          [mode]: result.quality,
        }));
        
        // Update form data with captured biometric data
        const newData = getCapturedData();
        onFieldChange('biometricData', {
          ...formData.biometricData,
          ...newData,
        });
      } else {
        setCaptureStatus('error');
      }
    } catch (error) {
      console.error('Biometric capture failed:', error);
      setCaptureStatus('error');
    }
  };

  // Retry capture
  const handleRetry = () => {
    setCaptureStatus('idle');
    setCaptureProgress(0);
    if (captureMode) {
      handleCaptureStart(captureMode);
    }
  };

  // Get quality color based on score
  const getQualityColor = (score, mode) => {
    const threshold = isEmergencyMode ? emergencyQualityThreshold : qualityThreshold;
    
    if (score >= threshold) return 'success';
    if (score >= threshold * 0.8) return 'warning';
    return 'error';
  };

  // Get quality label
  const getQualityLabel = (score, mode) => {
    const threshold = isEmergencyMode ? emergencyQualityThreshold : qualityThreshold;
    
    if (score >= threshold) return 'Excellent';
    if (score >= threshold * 0.8) return 'Good';
    if (score >= threshold * 0.6) return 'Fair';
    return 'Poor';
  };

  // Check if biometric requirements are met
  const isBiometricComplete = () => {
    const hasFingerprint = capturedData.fingerprints.length > 0;
    const hasFacial = capturedData.facialImage !== null;
    const hasConsent = biometricConsent;
    
    if (isEmergencyMode) {
      // Emergency mode: at least one biometric + consent
      return (hasFingerprint || hasFacial) && hasConsent;
    } else {
      // Standard mode: at least fingerprint + consent
      return hasFingerprint && hasConsent;
    }
  };

  // Get required biometrics for current mode
  const getRequiredBiometrics = () => {
    if (isEmergencyMode) {
      return ['fingerprint']; // Only fingerprint required in emergency
    }
    return ['fingerprint', 'facial']; // Both required in standard mode
  };

  // Render fingerprint capture section
  const renderFingerprintSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Fingerprint color="primary" />
          <Typography variant="h6">Fingerprint Capture</Typography>
          {isEmergencyMode && (
            <Chip
              icon={<Speed />}
              label="Emergency Mode"
              color="error"
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={2}>
          {fingerTypes.map((finger) => (
            <Grid item xs={12} sm={6} md={4} key={finger.value}>
              <Card
                variant={capturedData.fingerprints.some(f => f.type === finger.value) ? 'elevation' : 'outlined'}
                sx={{
                  bgcolor: capturedData.fingerprints.some(f => f.type === finger.value) ? 'success.light' : 'inherit',
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {finger.icon}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {finger.label}
                  </Typography>
                  
                  {capturedData.fingerprints.some(f => f.type === finger.value) ? (
                    <Box>
                      <CheckCircle color="success" />
                      <Typography variant="caption" color="success.main">
                        Captured
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleCaptureStart('fingerprint')}
                      disabled={!isDeviceReady || retryCount >= maxRetries}
                    >
                      Capture
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quality Information */}
        {qualityScores.fingerprint && (
          <Alert severity={getQualityColor(qualityScores.fingerprint, 'fingerprint')} sx={{ mt: 2 }}>
            <Typography variant="body2">
              Fingerprint Quality: {getQualityLabel(qualityScores.fingerprint, 'fingerprint')} 
              ({qualityScores.fingerprint}%)
            </Typography>
            <Typography variant="caption">
              Threshold: {isEmergencyMode ? emergencyQualityThreshold : qualityThreshold}%
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render facial capture section
  const renderFacialSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CameraAlt color="primary" />
          <Typography variant="h6">Facial Image Capture</Typography>
          {isEmergencyMode && (
            <Chip
              icon={<Speed />}
              label="Simplified Mode"
              color="warning"
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isEmergencyMode 
                ? 'Basic photo capture (liveness detection disabled)'
                : 'High-quality facial image with liveness detection'
              }
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={() => handleCaptureStart('facial')}
              disabled={!isDeviceReady}
              sx={{ mt: 1 }}
            >
              {capturedData.facialImage ? 'Recapture' : 'Capture Photo'}
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            {capturedData.facialImage ? (
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src={capturedData.facialImage}
                  alt="Captured facial image"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid #4caf50'
                  }}
                />
                <Typography variant="caption" color="success.main">
                  Photo captured successfully
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: '8px', 
                p: 3, 
                textAlign: 'center' 
              }}>
                <CameraAlt sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  No facial image captured
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Quality Information */}
        {qualityScores.facial && (
          <Alert severity={getQualityColor(qualityScores.facial, 'facial')} sx={{ mt: 2 }}>
            <Typography variant="body2">
              Facial Image Quality: {getQualityLabel(qualityScores.facial, 'facial')} 
              ({qualityScores.facial}%)
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render consent section
  const renderConsentSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security color="primary" />
          <Typography variant="h6">Biometric Consent</Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={biometricConsent}
              onChange={handleConsentChange}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                I consent to the collection, storage, and use of my biometric data 
                (fingerprints, facial images) for identification and verification purposes.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This consent is required to proceed with biometric enrollment.
              </Typography>
            </Box>
          }
        />

        {biometricConsent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Biometric consent provided. Your data will be stored securely using encryption.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Biometric Enrollment
        {isEmergencyMode && (
          <Chip
            icon={<Speed />}
            label="Emergency Mode - Reduced Requirements"
            color="error"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {isEmergencyMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Emergency mode: Reduced quality thresholds and simplified capture process. 
          Only fingerprint is required.
        </Alert>
      )}

      {/* Device Status */}
      <Alert 
        severity={isDeviceReady ? 'success' : 'warning'} 
        sx={{ mb: 2 }}
        icon={isDeviceReady ? <CheckCircle /> : <Warning />}
      >
        <Typography variant="body2">
          {isDeviceReady 
            ? `Biometric device ready: ${currentDevice?.name || 'Unknown device'}`
            : 'Biometric device not detected. Please check device connection.'
          }
        </Typography>
      </Alert>

      {/* Retry Count Warning */}
      {retryCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Retry attempts: {retryCount}/{maxRetries}
          </Typography>
        </Alert>
      )}

      {/* Biometric Capture Sections */}
      {renderFingerprintSection()}
      
      {!isEmergencyMode && renderFacialSection()}
      
      {renderConsentSection()}

      {/* Progress Summary */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enrollment Progress
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Fingerprint />
              </ListItemIcon>
              <ListItemText
                primary="Fingerprint"
                secondary={capturedData.fingerprints.length > 0 ? 'Captured' : 'Not captured'}
              />
              <ListItemSecondaryAction>
                {capturedData.fingerprints.length > 0 ? (
                  <CheckCircle color="success" />
                ) : (
                  <Error color="error" />
                )}
              </ListItemSecondaryAction>
            </ListItem>

            {!isEmergencyMode && (
              <ListItem>
                <ListItemIcon>
                  <CameraAlt />
                </ListItemIcon>
                <ListItemText
                  primary="Facial Image"
                  secondary={capturedData.facialImage ? 'Captured' : 'Not captured'}
                />
                <ListItemSecondaryAction>
                  {capturedData.facialImage ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            )}

            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Consent"
                secondary={biometricConsent ? 'Provided' : 'Not provided'}
              />
              <ListItemSecondaryAction>
                {biometricConsent ? (
                  <CheckCircle color="success" />
                ) : (
                  <Error color="error" />
                )}
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          {/* Overall Status */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              Overall Status:
            </Typography>
            <Chip
              icon={isBiometricComplete() ? <CheckCircle /> : <Warning />}
              label={isBiometricComplete() ? 'Complete' : 'Incomplete'}
              color={isBiometricComplete() ? 'success' : 'warning'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.biometric && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.biometric}
        </Alert>
      )}

      {/* Biometric Capture Dialog */}
      <Dialog
        open={showBiometricDialog}
        onClose={() => setShowBiometricDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {captureMode === 'fingerprint' ? <Fingerprint /> : <CameraAlt />}
            {captureMode === 'fingerprint' ? 'Fingerprint Capture' : 'Facial Image Capture'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <BiometricCapture
            open={showBiometricDialog}
            onClose={() => setShowBiometricDialog(false)}
            isEmergencyMode={isEmergencyMode}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBiometricDialog(false)}>Close</Button>
          {captureStatus === 'error' && (
            <Button onClick={handleRetry} startIcon={<Refresh />}>
              Retry
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BiometricEnrollmentStep; 