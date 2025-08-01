import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Fingerprint,
  CameraAlt,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Close,
  Visibility,
  VisibilityOff,
  Security,
  DeviceHub,
  Settings,
} from '@mui/icons-material';
import { useBiometric } from '../../contexts/BiometricContext';
import { useLanguage } from '../../contexts/LanguageContext';

const BiometricCapture = ({ open, onClose, isEmergencyMode = false }) => {
  const [captureMode, setCaptureMode] = useState(null); // 'fingerprint' or 'facial'
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureStatus, setCaptureStatus] = useState('idle'); // 'idle', 'capturing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [selectedFinger, setSelectedFinger] = useState('thumb');
  const [capturedData, setCapturedData] = useState({
    fingerprints: [],
    facialImage: null,
  });

  const { 
    captureFingerprint, 
    captureFacialImage, 
    getCapturedData, 
    isDeviceReady, 
    currentDevice,
    qualityThreshold,
    retryCount: biometricRetryCount,
    maxRetries,
  } = useBiometric();
  const { translate } = useLanguage();

  const fingerTypes = [
    { value: 'thumb', label: 'Thumb', icon: '👍' },
    { value: 'index', label: 'Index Finger', icon: '👆' },
    { value: 'middle', label: 'Middle Finger', icon: '🖕' },
    { value: 'ring', label: 'Ring Finger', icon: '💍' },
    { value: 'little', label: 'Little Finger', icon: '🤏' },
  ];

  useEffect(() => {
    if (open) {
      setCapturedData(getCapturedData());
    }
  }, [open, getCapturedData]);

  const handleCaptureFingerprint = async () => {
    setCaptureMode('fingerprint');
    setIsCapturing(true);
    setCaptureStatus('capturing');
    setCaptureProgress(0);
    setErrorMessage('');

    let progressInterval;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const fingerprintData = await captureFingerprint(selectedFinger);
      
      clearInterval(progressInterval);
      setCaptureProgress(100);
      setCaptureStatus('success');
      
      // Update captured data
      setCapturedData(prev => ({
        ...prev,
        fingerprints: [...prev.fingerprints, fingerprintData],
      }));
      
      setRetryCount(0);
      
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setCaptureStatus('error');
      setErrorMessage(error.message);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCaptureFacial = async () => {
    setCaptureMode('facial');
    setIsCapturing(true);
    setCaptureStatus('capturing');
    setCaptureProgress(0);
    setErrorMessage('');

    let progressInterval;

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setCaptureProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);

      const facialData = await captureFacialImage({
        skipLiveness: isEmergencyMode,
        skipICAO: isEmergencyMode,
      });
      
      clearInterval(progressInterval);
      setCaptureProgress(100);
      setCaptureStatus('success');
      
      // Update captured data
      setCapturedData(prev => ({
        ...prev,
        facialImage: facialData,
      }));
      
      setRetryCount(0);
      
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setCaptureStatus('error');
      setErrorMessage(error.message);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetry = () => {
    if (captureMode === 'fingerprint') {
      handleCaptureFingerprint();
    } else if (captureMode === 'facial') {
      handleCaptureFacial();
    }
  };

  const handleClose = () => {
    setCaptureMode(null);
    setIsCapturing(false);
    setCaptureStatus('idle');
    setCaptureProgress(0);
    setErrorMessage('');
    setRetryCount(0);
    onClose();
  };

  const getQualityColor = (quality) => {
    if (quality >= 80) return 'success';
    if (quality >= 60) return 'warning';
    return 'error';
  };

  const getQualityLabel = (quality) => {
    if (quality >= 80) return 'Excellent';
    if (quality >= 60) return 'Good';
    return 'Poor';
  };

  const canProceed = () => {
    if (isEmergencyMode) {
      return capturedData.fingerprints.length > 0 || capturedData.facialImage;
    }
    return capturedData.fingerprints.length >= 2 && capturedData.facialImage;
  };

  const renderCaptureInterface = () => {
    if (captureMode === 'fingerprint') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Fingerprint Capture
          </Typography>
          
          {!isCapturing && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Select finger to capture:
              </Typography>
              <Grid container spacing={1}>
                {fingerTypes.map((finger) => (
                  <Grid item key={finger.value}>
                    <Button
                      variant={selectedFinger === finger.value ? 'contained' : 'outlined'}
                      onClick={() => setSelectedFinger(finger.value)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>{finger.icon}</span>
                        <Typography variant="caption">{finger.label}</Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {isCapturing && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={80} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Capturing {selectedFinger} fingerprint...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Please place your {selectedFinger} on the scanner
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={captureProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {captureProgress}% Complete
              </Typography>
            </Box>
          )}

          {captureStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Fingerprint captured successfully!
            </Alert>
          )}

          {captureStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      );
    }

    if (captureMode === 'facial') {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Facial Image Capture
          </Typography>
          
          {!isCapturing && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CameraAlt sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Position your face in the camera view
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isEmergencyMode 
                  ? 'Basic photo capture (liveness detection skipped)'
                  : 'Ensure good lighting and look directly at the camera'
                }
              </Typography>
            </Box>
          )}

          {isCapturing && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={80} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Capturing facial image...
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {isEmergencyMode 
                  ? 'Taking photo...'
                  : 'Performing liveness detection...'
                }
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={captureProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {captureProgress}% Complete
              </Typography>
            </Box>
          )}

          {captureStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Facial image captured successfully!
            </Alert>
          )}

          {captureStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Biometric Capture
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => setCaptureMode('fingerprint')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Fingerprint sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Fingerprint Capture
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isEmergencyMode 
                    ? 'Capture at least one fingerprint'
                    : 'Capture multiple fingerprints for better identification'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => setCaptureMode('facial')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CameraAlt sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Facial Image Capture
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isEmergencyMode 
                    ? 'Basic photo capture'
                    : 'Full facial capture with liveness detection'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCapturedData = () => {
    if (capturedData.fingerprints.length === 0 && !capturedData.facialImage) {
      return null;
    }

    return (
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Captured Data
        </Typography>
        
        {capturedData.fingerprints.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Fingerprints ({capturedData.fingerprints.length})
            </Typography>
            <List dense>
              {capturedData.fingerprints.map((fp, index) => (
                <ListItem key={fp.id}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${fp.fingerType} finger`}
                    secondary={`Quality: ${fp.quality.toFixed(1)}% (${getQualityLabel(fp.quality)})`}
                  />
                  <Chip
                    label={getQualityLabel(fp.quality)}
                    color={getQualityColor(fp.quality)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {capturedData.facialImage && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Facial Image
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Facial image captured"
                  secondary={`Quality: ${capturedData.facialImage.quality.toFixed(1)}%`}
                />
                <Chip
                  label={getQualityLabel(capturedData.facialImage.quality)}
                  color={getQualityColor(capturedData.facialImage.quality)}
                  size="small"
                />
              </ListItem>
            </List>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Biometric Capture
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEmergencyMode && (
              <Chip label="Emergency Mode" color="error" size="small" />
            )}
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Device Status */}
        <Alert 
          severity={isDeviceReady() ? 'success' : 'warning'} 
          sx={{ mb: 2 }}
          icon={isDeviceReady() ? <DeviceHub /> : <Warning />}
        >
          {isDeviceReady() 
            ? `Device ready: ${currentDevice?.name || 'Unknown device'}`
            : 'No biometric device detected'
          }
        </Alert>

        {/* Quality Threshold Info */}
        <Alert severity="info" sx={{ mb: 2 }}>
          Quality threshold: {qualityThreshold}% 
          {isEmergencyMode && ' (reduced for emergency mode)'}
        </Alert>

        {/* Main Capture Interface */}
        {renderCaptureInterface()}

        {/* Captured Data Summary */}
        {renderCapturedData()}

        {/* Error and Retry */}
        {captureStatus === 'error' && retryCount < maxRetries && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Retry {retryCount + 1} of {maxRetries} attempts
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        
        {captureStatus === 'error' && retryCount < maxRetries && (
          <Button
            onClick={handleRetry}
            variant="outlined"
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        )}
        
        {captureMode && !isCapturing && captureStatus !== 'success' && (
          <Button
            onClick={captureMode === 'fingerprint' ? handleCaptureFingerprint : handleCaptureFacial}
            variant="contained"
            startIcon={captureMode === 'fingerprint' ? <Fingerprint /> : <CameraAlt />}
          >
            Capture {captureMode === 'fingerprint' ? 'Fingerprint' : 'Facial Image'}
          </Button>
        )}
        
        {canProceed() && (
          <Button
            onClick={handleClose}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BiometricCapture; 