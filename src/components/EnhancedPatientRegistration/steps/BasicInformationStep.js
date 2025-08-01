import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  CalendarToday,
  Warning,
  CheckCircle,
  Error,
  Info,
  Speed,
} from '@mui/icons-material';
import { usePatient } from '../../../contexts/PatientContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const BasicInformationStep = ({ formData, errors, onFieldChange, isEmergencyMode }) => {
  const { translate, currentLanguage } = useLanguage();
  const { 
    bloodGroups, 
    validationRules, 
    getPinCodeInfo,
    pinCodeMapping 
  } = usePatient();

  const [ageCalculated, setAgeCalculated] = useState(false);
  const [pinCodeInfo, setPinCodeInfo] = useState(null);
  const [fieldValidation, setFieldValidation] = useState({});

  // Gender options with cultural considerations
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Enhanced field validation (AC 1.1.1, AC 2.2.3)
  const validateField = (field, value) => {
    const rules = validationRules[field];
    if (!rules) return { isValid: true, message: '' };

    let isValid = true;
    let message = '';

    // Length validation
    if (rules.min && value.length < rules.min) {
      isValid = false;
      message = `Minimum ${rules.min} characters required`;
    }
    if (rules.max && value.length > rules.max) {
      isValid = false;
      message = `Maximum ${rules.max} characters allowed`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      switch (field) {
        case 'firstName':
        case 'lastName':
          message = 'Only letters and spaces allowed';
          break;
        case 'mobile':
          message = 'Invalid mobile number format';
          break;
        case 'email':
          message = 'Invalid email format';
          break;
        case 'pinCode':
          message = 'PIN code must be 6 digits';
          break;
        default:
          message = 'Invalid format';
      }
    }

    // Age validation
    if (field === 'age' && value) {
      const ageNum = parseInt(value);
      if (ageNum < 0 || ageNum > 150) {
        isValid = false;
        message = 'Age must be between 0 and 150';
      }
    }

    // Mobile number validation (Indian format)
    if (field === 'mobile' && value) {
      if (!/^[6-9]\d{9}$/.test(value)) {
        isValid = false;
        message = 'Mobile number must start with 6-9 and be 10 digits';
      }
    }

    return { isValid, message };
  };

  // Handle field changes with validation and auto-population
  const handleFieldChange = (field, value) => {
    onFieldChange(field, value);

    // Validate field
    const validation = validateField(field, value);
    setFieldValidation(prev => ({
      ...prev,
      [field]: validation
    }));

    // Auto-populate age from date of birth
    if (field === 'dateOfBirth' && value) {
      const calculatedAge = calculateAge(value);
      onFieldChange('age', calculatedAge);
      setAgeCalculated(true);
    }

    // Auto-populate address from PIN code (AC 2.2.2)
    if (field === 'pinCode' && value.length === 6) {
      const pinInfo = getPinCodeInfo(value);
      if (pinInfo) {
        setPinCodeInfo(pinInfo);
        onFieldChange('state', pinInfo.state);
        onFieldChange('district', pinInfo.district);
        onFieldChange('subDistrict', pinInfo.subDistrict);
      } else {
        setPinCodeInfo(null);
      }
    }
  };

  // Get field status for visual indicators
  const getFieldStatus = (field) => {
    if (errors[field]) return 'error';
    if (fieldValidation[field]?.isValid === false) return 'error';
    if (fieldValidation[field]?.isValid === true) return 'success';
    return 'default';
  };

  // Get field helper text
  const getFieldHelperText = (field) => {
    if (errors[field]) return errors[field];
    if (fieldValidation[field]?.message) return fieldValidation[field].message;
    return '';
  };

  // Check if step is complete for emergency mode
  const isStepComplete = () => {
    const requiredFields = ['firstName', 'age', 'gender', 'mobile'];
    return requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
        {isEmergencyMode && (
          <Chip
            icon={<Speed />}
            label="Emergency Mode - Minimal Fields"
            color="error"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {isEmergencyMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Emergency mode: Only essential fields are required. Additional information can be added later.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Name Fields */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="First Name *"
            value={formData.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            error={getFieldStatus('firstName') === 'error'}
            helperText={getFieldHelperText('firstName')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color={getFieldStatus('firstName') === 'success' ? 'success' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Middle Name"
            value={formData.middleName}
            onChange={(e) => handleFieldChange('middleName', e.target.value)}
            error={getFieldStatus('middleName') === 'error'}
            helperText={getFieldHelperText('middleName')}
            disabled={isEmergencyMode}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            error={getFieldStatus('lastName') === 'error'}
            helperText={getFieldHelperText('lastName')}
            disabled={isEmergencyMode}
          />
        </Grid>

        {/* Age and Date of Birth */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
            disabled={isEmergencyMode}
          />
          {ageCalculated && (
            <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
              Age calculated: {formData.age} years
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Age *"
            type="number"
            value={formData.age}
            onChange={(e) => handleFieldChange('age', e.target.value)}
            error={getFieldStatus('age') === 'error'}
            helperText={getFieldHelperText('age')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Gender */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={getFieldStatus('gender') === 'error'}>
            <InputLabel>Gender *</InputLabel>
            <Select
              value={formData.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              label="Gender *"
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Mobile Number *"
            value={formData.mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
            error={getFieldStatus('mobile') === 'error'}
            helperText={getFieldHelperText('mobile')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color={getFieldStatus('mobile') === 'success' ? 'success' : 'action'} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Alternate Mobile"
            value={formData.alternateMobile}
            onChange={(e) => handleFieldChange('alternateMobile', e.target.value)}
            error={getFieldStatus('alternateMobile') === 'error'}
            helperText={getFieldHelperText('alternateMobile')}
            disabled={isEmergencyMode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            error={getFieldStatus('email') === 'error'}
            helperText={getFieldHelperText('email')}
            disabled={isEmergencyMode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* PIN Code with Auto-population */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="PIN Code"
            value={formData.pinCode}
            onChange={(e) => handleFieldChange('pinCode', e.target.value)}
            error={getFieldStatus('pinCode') === 'error'}
            helperText={getFieldHelperText('pinCode')}
            disabled={isEmergencyMode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Info />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Auto-populated Address Fields */}
        {pinCodeInfo && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Address Auto-populated from PIN Code
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2">
                      <strong>State:</strong> {pinCodeInfo.state}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2">
                      <strong>District:</strong> {pinCodeInfo.district}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2">
                      <strong>Sub-District:</strong> {pinCodeInfo.subDistrict}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Validation Summary */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2">Field Validation Status:</Typography>
            {Object.keys(fieldValidation).map(field => (
              <Tooltip key={field} title={`${field}: ${fieldValidation[field]?.isValid ? 'Valid' : 'Invalid'}`}>
                <IconButton size="small">
                  {fieldValidation[field]?.isValid ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Error color="error" />
                  )}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Grid>

        {/* Emergency Mode Completion Status */}
        {isEmergencyMode && (
          <Grid item xs={12}>
            <Alert 
              severity={isStepComplete() ? 'success' : 'warning'}
              icon={isStepComplete() ? <CheckCircle /> : <Warning />}
            >
              {isStepComplete() 
                ? 'All required fields completed for emergency registration'
                : 'Please complete all required fields to proceed'
              }
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BasicInformationStep; 