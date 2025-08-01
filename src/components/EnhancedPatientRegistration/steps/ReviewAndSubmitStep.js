import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Person,
  LocationOn,
  Fingerprint,
  Security,
  FamilyRestroom,
  LocalHospital,
  CreditCard,
  Speed,
  Timer,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';

const ReviewAndSubmitStep = ({ formData, performanceMetrics, isEmergencyMode }) => {
  const { translate } = useLanguage();

  const formatTime = (milliseconds) => {
    return `${Math.round(milliseconds / 1000)}s`;
  };

  const getDataQualityScore = () => {
    let score = 0;
    let total = 0;

    // Basic Information (30% weight)
    if (formData.firstName && formData.lastName && formData.dateOfBirth) score += 30;
    total += 30;

    // Contact Information (15% weight)
    if (formData.mobile || formData.email) score += 15;
    total += 15;

    // Address Information (20% weight)
    if (formData.addresses && formData.addresses.length > 0) {
      const primaryAddress = formData.addresses.find(addr => addr.isPrimary);
      if (primaryAddress && primaryAddress.address && primaryAddress.city) score += 20;
    }
    total += 20;

    // Biometric Data (25% weight)
    if (formData.biometricData) {
      const biometricScore = (formData.biometricData.fingerprints?.length || 0) * 5 +
                           (formData.biometricData.facialImage ? 10 : 0) +
                           (formData.biometricData.iris ? 10 : 0);
      score += Math.min(biometricScore, 25);
    }
    total += 25;

    // Consent (10% weight)
    if (formData.consents && Object.values(formData.consents).some(consent => consent)) score += 10;
    total += 10;

    return Math.round((score / total) * 100);
  };

  const dataQualityScore = getDataQualityScore();

  const renderBasicInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Person color="primary" />
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Name</Typography>
            <Typography variant="body1">
              {formData.firstName} {formData.middleName} {formData.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
            <Typography variant="body1">{formData.dateOfBirth}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Gender</Typography>
            <Typography variant="body1">{formData.gender}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Age</Typography>
            <Typography variant="body1">{formData.age} years</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Mobile</Typography>
            <Typography variant="body1">{formData.mobile || 'Not provided'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1">{formData.email || 'Not provided'}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAddressInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" />
          Address Information
        </Typography>
        {formData.addresses && formData.addresses.map((address, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary">
              {address.type === 'permanent' ? 'Permanent Address' : 'Temporary Address'}
              {address.isPrimary && <Chip size="small" label="Primary" color="primary" sx={{ ml: 1 }} />}
            </Typography>
            <Typography variant="body2">
              {address.address}, {address.city}, {address.district}, {address.state} - {address.pinCode}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderBiometricInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Fingerprint color="primary" />
          Biometric Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Fingerprints</Typography>
            <Typography variant="body1">
              {formData.biometricData?.fingerprints?.length || 0} captured
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Facial Image</Typography>
            <Typography variant="body1">
              {formData.biometricData?.facialImage ? 'Captured' : 'Not captured'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Iris</Typography>
            <Typography variant="body1">
              {formData.biometricData?.iris ? 'Captured' : 'Not captured'}
            </Typography>
          </Grid>
        </Grid>
        {performanceMetrics.biometricQuality > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">Quality Score</Typography>
            <LinearProgress
              variant="determinate"
              value={performanceMetrics.biometricQuality}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption">{performanceMetrics.biometricQuality}%</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderConsentInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security color="primary" />
          Consent Management
        </Typography>
        <Grid container spacing={2}>
          {formData.consents && Object.entries(formData.consents).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {value ? <CheckCircle color="success" /> : <Error color="error" />}
                <Typography variant="body2">
                  {key.charAt(0).toUpperCase() + key.slice(1)} Consent
                </Typography>
                <Chip
                  size="small"
                  label={value ? 'Given' : 'Not Given'}
                  color={value ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderMedicalInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocalHospital color="primary" />
          Medical Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Blood Group</Typography>
            <Typography variant="body1">{formData.bloodGroup || 'Not specified'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Allergies</Typography>
            <Typography variant="body1">
              {formData.allergies && formData.allergies.length > 0 
                ? formData.allergies.join(', ') 
                : 'None reported'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Medical History</Typography>
            <Typography variant="body1">
              {formData.medicalHistory || 'Not provided'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderFamilyInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FamilyRestroom color="primary" />
          Family Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Family ID</Typography>
            <Typography variant="body1">{formData.familyId || 'Not assigned'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Family Role</Typography>
            <Typography variant="body1">{formData.familyRole || 'Not specified'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">Family Members</Typography>
            <Typography variant="body1">
              {formData.familyMembers && formData.familyMembers.length > 0 
                ? `${formData.familyMembers.length} members` 
                : 'No family members linked'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderInsuranceInformation = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CreditCard color="primary" />
          Insurance Information
        </Typography>
        {formData.insurancePolicies && formData.insurancePolicies.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell>Policy Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Valid Until</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.insurancePolicies.map((policy, index) => (
                  <TableRow key={index}>
                    <TableCell>{policy.provider}</TableCell>
                    <TableCell>{policy.policyNumber}</TableCell>
                    <TableCell>{policy.type}</TableCell>
                    <TableCell>{policy.validUntil}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No insurance policies added</Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderPerformanceMetrics = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Speed color="primary" />
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Total Time</Typography>
            <Typography variant="h6" color="primary">
              {formatTime(performanceMetrics.totalTime)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Data Quality</Typography>
            <Typography variant="h6" color="primary">
              {dataQualityScore}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Registration Mode</Typography>
            <Chip
              label={isEmergencyMode ? 'Emergency' : 'Standard'}
              color={isEmergencyMode ? 'error' : 'primary'}
              icon={isEmergencyMode ? <Warning /> : <CheckCircle />}
            />
          </Grid>
        </Grid>
        
        {performanceMetrics.stepTimes && performanceMetrics.stepTimes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Step-wise Performance
            </Typography>
            <List dense>
              {performanceMetrics.stepTimes.map((step, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <Timer fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Step ${index + 1}`}
                    secondary={formatTime(step.time)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderValidationSummary = () => {
    const issues = [];
    
    if (!formData.firstName || !formData.lastName) {
      issues.push('Basic information incomplete');
    }
    
    if (!formData.addresses || formData.addresses.length === 0) {
      issues.push('Address information missing');
    }
    
    if (!formData.biometricData?.fingerprints || formData.biometricData.fingerprints.length === 0) {
      issues.push('Biometric data incomplete');
    }
    
    if (!formData.consents || !Object.values(formData.consents).some(consent => consent)) {
      issues.push('No consents given');
    }

    return (
      <Alert 
        severity={issues.length === 0 ? 'success' : 'warning'} 
        sx={{ mb: 2 }}
        icon={issues.length === 0 ? <CheckCircle /> : <Warning />}
      >
        <Typography variant="subtitle2">
          {issues.length === 0 ? 'All required information is complete' : 'Please review the following issues:'}
        </Typography>
        {issues.length > 0 && (
          <List dense sx={{ mt: 1 }}>
            {issues.map((issue, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <Error fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>
        )}
      </Alert>
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Review & Submit Registration
      </Typography>
      
      {renderValidationSummary()}
      
      {renderBasicInformation()}
      {renderAddressInformation()}
      {renderBiometricInformation()}
      {renderConsentInformation()}
      {renderMedicalInformation()}
      {renderFamilyInformation()}
      {renderInsuranceInformation()}
      {renderPerformanceMetrics()}
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Please review all information carefully before submitting. Once submitted, 
          the patient will be registered in the HMIS system and a unique patient ID will be generated.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ReviewAndSubmitStep; 