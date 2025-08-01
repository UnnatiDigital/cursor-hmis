import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PersonAdd,
  Warning,
  Fingerprint,
  CameraAlt,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  ExpandMore,
  Language,
  Translate,
  Save,
  Cancel,
  ArrowForward,
  ArrowBack,
  Add,
  Remove,
  VerifiedUser,
  Security,
  FamilyRestroom,
  LocationOn,
  Phone,
  Email,
  Work,
  School,
  Religion,
  Bloodtype,
  MedicalServices,
  CreditCard,
  DocumentScanner,
  QrCode,
  Search,
  History,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBiometric } from '../../contexts/BiometricContext';
import BiometricCapture from '../BiometricCapture/BiometricCapture';
import DuplicateCheckDialog from '../DuplicateCheckDialog/DuplicateCheckDialog';
import ConsentForm from '../ConsentForm/ConsentForm';

const PatientRegistration = () => {
  const { translate } = useLanguage();
  const { 
    registerPatient, 
    checkForDuplicates, 
    duplicateResults, 
    setDuplicateResults,
    getPinCodeInfo,
    validatePatientData,
    registrationMode,
    setRegistrationMode,
    bloodGroups,
    relationshipTypes,
    insuranceProviders,
    validationRules,
  } = usePatient();
  const { captureFingerprint, captureFacialImage } = useBiometric();

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    
    // Address Information
    address: '',
    pinCode: '',
    state: '',
    district: '',
    subDistrict: '',
    city: '',
    
    // Medical Information
    bloodGroup: '',
    allergies: [],
    medicalHistory: '',
    medications: '',
    
    // Extended Demographics
    occupation: '',
    education: '',
    religion: '',
    caste: '',
    maritalStatus: '',
    
    // Family Information
    familyId: '',
    relationship: '',
    emergencyContact: '',
    guardian: '',
    
    // Insurance Information
    insuranceProvider: '',
    policyNumber: '',
    expiryDate: '',
    coverageType: '',
    
    // Biometric Data
    biometricData: null,
    
    // Consent
    consentGiven: false,
    consentType: '',
    
    // Emergency Mode
    isEmergencyMode: false,
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [registrationStartTime, setRegistrationStartTime] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Emergency mode toggle
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Steps for registration
  const steps = isEmergencyMode 
    ? [translate('patient.basicInfo', 'Basic Info'), translate('patient.biometric', 'Biometric'), translate('common.submit', 'Submit')]
    : [translate('patient.basicInfo', 'Basic Info'), translate('patient.address', 'Address'), translate('patient.medical', 'Medical'), translate('patient.extended', 'Extended'), translate('patient.biometric', 'Biometric'), translate('patient.consent', 'Consent'), translate('common.submit', 'Submit')];

  useEffect(() => {
    setRegistrationStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (isEmergencyMode) {
      setRegistrationMode('emergency');
    } else {
      setRegistrationMode('standard');
    }
  }, [isEmergencyMode, setRegistrationMode]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-populate address fields from PIN code
    if (field === 'pinCode' && value.length === 6) {
      const pinInfo = getPinCodeInfo(value);
      if (pinInfo) {
        setFormData(prev => ({
          ...prev,
          state: pinInfo.state,
          district: pinInfo.district,
          subDistrict: pinInfo.subDistrict,
        }));
      }
    }
  };

  // Handle allergy management
  const handleAllergyChange = (index, field, value) => {
    const newAllergies = [...formData.allergies];
    newAllergies[index] = { ...newAllergies[index], [field]: value };
    setFormData(prev => ({ ...prev, allergies: newAllergies }));
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, { name: '', severity: 'Mild', reaction: '' }]
    }));
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  // Handle address management
  const handleAddressChange = (index, field, value) => {
    const newAddresses = [...(formData.addresses || [])];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData(prev => ({ ...prev, addresses: newAddresses }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), { 
        type: 'Current', 
        address: '', 
        pinCode: '', 
        state: '', 
        district: '',
        isPrimary: false 
      }]
    }));
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!isEmergencyMode && !formData.mobile) newErrors.mobile = 'Mobile number is required';
        if (formData.mobile && !validationRules.mobile.pattern.test(formData.mobile)) {
          newErrors.mobile = 'Invalid mobile number format';
        }
        if (formData.email && !validationRules.email.pattern.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;
        
      case 1: // Address (standard mode only)
        if (!isEmergencyMode) {
          if (!formData.address) newErrors.address = 'Address is required';
          if (!formData.pinCode) newErrors.pinCode = 'PIN code is required';
          if (formData.pinCode && !validationRules.pinCode.pattern.test(formData.pinCode)) {
            newErrors.pinCode = 'PIN code must be 6 digits';
          }
        }
        break;
        
      case 2: // Medical (standard mode only)
        if (!isEmergencyMode && formData.allergies.length > 0) {
          formData.allergies.forEach((allergy, index) => {
            if (!allergy.name) newErrors[`allergy_${index}_name`] = 'Allergy name is required';
            if (!allergy.severity) newErrors[`allergy_${index}_severity`] = 'Severity is required';
          });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Biometric capture
  const handleBiometricCapture = async () => {
    setShowBiometricDialog(true);
  };

  const handleBiometricComplete = (biometricData) => {
    setFormData(prev => ({ ...prev, biometricData }));
    setShowBiometricDialog(false);
    handleNext();
  };

  // Consent handling
  const handleConsentComplete = (consentData) => {
    setFormData(prev => ({ 
      ...prev, 
      consentGiven: true, 
      consentType: consentData.type,
      consentDetails: consentData 
    }));
    setShowConsentDialog(false);
    handleNext();
  };

  // Form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Final validation
      const validationErrors = validatePatientData(formData, isEmergencyMode);
      if (validationErrors.length > 0) {
        setErrors(validationErrors.reduce((acc, error) => ({ ...acc, [error.field]: error.message }), {}));
        return;
      }

      // Check for duplicates
      const duplicates = await checkForDuplicates(formData);
      if (duplicates.length > 0 && !isEmergencyMode) {
        setShowDuplicateDialog(true);
        return;
      }

      // Register patient
      const patientData = {
        ...formData,
        registrationStartTime,
        registrationMode: isEmergencyMode ? 'emergency' : 'standard',
      };

      await registerPatient(patientData, isEmergencyMode);
      
      // Reset form
      setFormData({
        firstName: '', lastName: '', age: '', gender: '', mobile: '', email: '',
        address: '', pinCode: '', state: '', district: '', subDistrict: '', city: '',
        bloodGroup: '', allergies: [], medicalHistory: '', medications: '',
        occupation: '', education: '', religion: '', caste: '', maritalStatus: '',
        familyId: '', relationship: '', emergencyContact: '', guardian: '',
        insuranceProvider: '', policyNumber: '', expiryDate: '', coverageType: '',
        biometricData: null, consentGiven: false, consentType: '', isEmergencyMode: false,
      });
      setActiveStep(0);
      setErrors({});
      
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle duplicate confirmation
  const handleDuplicateConfirm = async () => {
    setShowDuplicateDialog(false);
    await handleSubmit();
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateDialog(false);
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {translate('patient.basicInfo')}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translate('patient.firstName')}
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translate('patient.lastName')}
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translate('patient.age')}
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                  error={!!errors.age}
                  helperText={errors.age}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender} required>
                  <InputLabel>{translate('patient.gender')}</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    label={translate('patient.gender')}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translate('patient.mobile')}
                  value={formData.mobile}
                  onChange={(e) => handleFieldChange('mobile', e.target.value)}
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  required={!isEmergencyMode}
                  disabled={isEmergencyMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return isEmergencyMode ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Biometric Capture
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Emergency mode: Quick biometric capture with reduced quality requirements
            </Typography>
            <Button
              variant="contained"
              startIcon={<Fingerprint />}
              onClick={handleBiometricCapture}
              fullWidth
              size="large"
            >
              Capture Biometric (Emergency Mode)
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                  error={!!errors.pinCode}
                  helperText={errors.pinCode || (formData.state ? `Auto-filled: ${formData.state}, ${formData.district}` : '')}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                  InputProps={{ readOnly: !!getPinCodeInfo(formData.pinCode) }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="District"
                  value={formData.district}
                  onChange={(e) => handleFieldChange('district', e.target.value)}
                  InputProps={{ readOnly: !!getPinCodeInfo(formData.pinCode) }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return isEmergencyMode ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Submit Registration
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Emergency registration will be completed with minimal data. 
              Full registration can be completed later.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              fullWidth
              size="large"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Emergency Registration'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    value={formData.bloodGroup}
                    onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                    label="Blood Group"
                  >
                    {bloodGroups.map((bg) => (
                      <MenuItem key={bg.value} value={bg.value}>
                        <Box sx={{ color: bg.color }}>
                          {bg.label} {bg.isNegative && <Warning fontSize="small" />}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Allergies
                </Typography>
                {formData.allergies.map((allergy, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Allergy Name"
                            value={allergy.name}
                            onChange={(e) => handleAllergyChange(index, 'name', e.target.value)}
                            error={!!errors[`allergy_${index}_name`]}
                            helperText={errors[`allergy_${index}_name`]}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Severity</InputLabel>
                            <Select
                              value={allergy.severity}
                              onChange={(e) => handleAllergyChange(index, 'severity', e.target.value)}
                              label="Severity"
                            >
                              <MenuItem value="Mild">Mild</MenuItem>
                              <MenuItem value="Severe">Severe</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Reaction"
                            value={allergy.reaction}
                            onChange={(e) => handleAllergyChange(index, 'reaction', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <IconButton onClick={() => removeAllergy(index)} color="error">
                            <Remove />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={addAllergy}
                  variant="outlined"
                >
                  Add Allergy
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical History"
                  multiline
                  rows={3}
                  value={formData.medicalHistory}
                  onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Extended Demographics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Occupation"
                  value={formData.occupation}
                  onChange={(e) => handleFieldChange('occupation', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Education"
                  value={formData.education}
                  onChange={(e) => handleFieldChange('education', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Religion"
                  value={formData.religion}
                  onChange={(e) => handleFieldChange('religion', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Caste"
                  value={formData.caste}
                  onChange={(e) => handleFieldChange('caste', e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    value={formData.maritalStatus}
                    onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                    label="Marital Status"
                  >
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Biometric Capture
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Capture fingerprint and facial image for patient identification
            </Typography>
            <Button
              variant="contained"
              startIcon={<Fingerprint />}
              onClick={handleBiometricCapture}
              fullWidth
              size="large"
            >
              Capture Biometric
            </Button>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Consent & Privacy
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Patient consent is required for data collection and biometric storage
            </Typography>
            <Button
              variant="contained"
              startIcon={<VerifiedUser />}
              onClick={() => setShowConsentDialog(true)}
              fullWidth
              size="large"
            >
              Collect Consent
            </Button>
          </Box>
        );

      case 6:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review all information before submitting
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              fullWidth
              size="large"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Registration'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {translate('patient.registration')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEmergencyMode}
                  onChange={(e) => setIsEmergencyMode(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Error color="error" />
                  {translate('patient.emergencyMode', 'Emergency Mode')}
                </Box>
              }
            />
          </Box>
        </Box>

        {/* Emergency Mode Alert */}
        {isEmergencyMode && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              {translate('patient.emergencyModeActive', 'Emergency Mode Active - Reduced data requirements for quick registration')}
            </Typography>
            <Typography variant="body2">
              {translate('patient.emergencyModeDescription', 'Only basic information and one biometric are required. Full registration can be completed later.')}
            </Typography>
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            {translate('common.back', 'Back')}
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<Save />}
              >
                {isSubmitting ? translate('common.submitting', 'Submitting...') : translate('common.submit', 'Submit')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                {translate('common.next', 'Next')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Dialogs */}
      <BiometricCapture
        open={showBiometricDialog}
        onClose={() => setShowBiometricDialog(false)}
        onComplete={handleBiometricComplete}
        isEmergencyMode={isEmergencyMode}
      />

      <ConsentForm
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        onComplete={handleConsentComplete}
      />

      <DuplicateCheckDialog
        open={showDuplicateDialog}
        duplicates={duplicateResults}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
      />
    </Box>
  );
};

export default PatientRegistration; 