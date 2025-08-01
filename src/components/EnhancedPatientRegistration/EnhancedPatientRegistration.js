import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd,
  LocalHospital,
  Fingerprint,
  Security,
  CheckCircle,
  Warning,
  Error,
  Save,
  Cancel,
  Settings,
  Speed,
  Timer,
  Person,
  Phone,
  Email,
  CalendarToday,
  LocationOn,
  Home,
  Work,
  Add,
  Remove,
  CheckCircle as CheckCircleIcon,
  Bloodtype,
  Close,
} from '@mui/icons-material';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBiometric } from '../../contexts/BiometricContext';
import { toast } from 'react-toastify';

const EnhancedPatientRegistration = () => {
  const { translate, currentLanguage } = useLanguage();
  const { 
    registerPatient, 
    checkForDuplicates, 
    duplicateResults, 
    setDuplicateResults,
    validatePatientData,
    registrationMode,
    setRegistrationMode,
    getRegistrationStats,
    bloodGroups,
    validationRules,
    getPinCodeInfo,
  } = usePatient();
  const { 
    isDeviceReady, 
    setEmergencyMode, 
    setStandardMode,
    getCapturedData,
    captureFingerprint,
    captureFacialImage,
  } = useBiometric();

  // Initial form data
  const initialFormData = {
    // Basic Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    mobile: '',
    email: '',
    alternateMobile: '',
    
    // Extended Demographics
    occupation: '',
    education: '',
    religion: '',
    caste: '',
    maritalStatus: '',
    nationality: '',
    motherTongue: '',
    preferredLanguage: '',
    
    // Medical Information
    bloodGroup: '',
    allergies: [],
    allergyDetails: [], // New field for detailed allergy information
    medicalHistory: '',
    medications: '',
    chronicConditions: [],
    emergencyContact: {
      name: '',
      relationship: '',
      mobile: '',
      address: '',
    },
    
    // Address Management
    addresses: [{
      type: 'permanent',
      address: '',
      pinCode: '',
      state: '',
      district: '',
      subDistrict: '',
      city: '',
      isPrimary: true,
    }],
    
    // Insurance Information
    insurancePolicies: [],
    
    // Family Information
    familyId: '',
    familyRole: '',
    familyMembers: [],
    
    // Biometric Data
    biometricData: {
      fingerprints: [],
      facialImage: null,
      iris: null,
      consentGiven: false,
    },
    
    // Consent Management
    consents: {
      biometric: false,
      dataSharing: false,
      research: false,
      treatment: false,
      emergency: false,
    },
    
    // Registration Mode
    isEmergencyMode: false,
    registrationType: 'walkin',
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStartTime, setRegistrationStartTime] = useState(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [ocrResults, setOcrResults] = useState({});
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [mfaStep, setMfaStep] = useState(1); // 1: Biometric, 2: OTP, 3: Document
  const [mfaData, setMfaData] = useState({
    biometricVerified: false,
    otpSent: false,
    otpVerified: false,
    documentUploaded: false,
    updateType: '', // 'minor', 'major', 'critical'
    fieldToUpdate: '',
    newValue: '',
  });

  // Keyboard shortcuts configuration
  const keyboardShortcuts = {
    // Navigation shortcuts
    'Alt + 1': 'Go to Basic Information',
    'Alt + 2': 'Go to Extended Demographics',
    'Alt + 3': 'Go to Address Management',
    'Alt + 4': 'Go to Medical Information',
    'Alt + 5': 'Go to Allergies',
    'Alt + 6': 'Go to Biometric Enrollment',
    'Alt + 7': 'Go to Consents',
    
    // Form shortcuts
    'Ctrl + S': 'Save/Submit Form',
    'Ctrl + R': 'Reset Form',
    'Ctrl + Z': 'Undo Last Change',
    'Ctrl + Y': 'Redo Last Change',
    'Ctrl + A': 'Add New Allergy',
    'Ctrl + D': 'Add New Address',
    
    // Emergency mode shortcuts
    'Alt + E': 'Toggle Emergency Mode',
    'Ctrl + E': 'Enable Emergency Mode',
    'Ctrl + N': 'Disable Emergency Mode',
    
    // Biometric shortcuts
    'Alt + F': 'Capture Fingerprint',
    'Alt + P': 'Capture Photo',
    'Alt + I': 'Capture Iris',
    
    // Help shortcuts
    'F1': 'Show Help',
    'Ctrl + /': 'Show Keyboard Shortcuts',
    'Esc': 'Close Dialogs/Cancel',
  };

  // Keyboard event handler
  const handleKeyDown = (event) => {
    // Prevent shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const alt = event.altKey;
    const shift = event.shiftKey;

    // Navigation shortcuts
    if (alt && key === '1') {
      event.preventDefault();
      // Scroll to basic information
      document.getElementById('basic-info-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '2') {
      event.preventDefault();
      // Scroll to extended demographics
      document.getElementById('extended-demographics-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '3') {
      event.preventDefault();
      // Scroll to address management
      document.getElementById('address-management-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '4') {
      event.preventDefault();
      // Scroll to medical information
      document.getElementById('medical-information-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '5') {
      event.preventDefault();
      // Scroll to allergies
      document.getElementById('allergies-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '6') {
      event.preventDefault();
      // Scroll to biometric enrollment
      document.getElementById('biometric-enrollment-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (alt && key === '7') {
      event.preventDefault();
      // Scroll to consents
      document.getElementById('consents-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    // Form shortcuts
    if (ctrl && key === 's') {
      event.preventDefault();
      if (formComplete && !isSubmitting) {
        handleSubmit(event);
      }
    }
    if (ctrl && key === 'r') {
      event.preventDefault();
      setFormData(initialFormData);
      setErrors({});
      setIsSuccess(false);
    }
    if (ctrl && key === 'a') {
      event.preventDefault();
      addAllergy();
    }
    if (ctrl && key === 'd') {
      event.preventDefault();
      addAddress();
    }

    // Emergency mode shortcuts
    if (alt && key === 'e') {
      event.preventDefault();
      handleEmergencyModeToggle();
    }
    if (ctrl && key === 'e') {
      event.preventDefault();
      if (!formData.isEmergencyMode) {
        setShowEmergencyDialog(true);
      }
    }
    if (ctrl && key === 'n') {
      event.preventDefault();
      if (formData.isEmergencyMode) {
        setFormData(prev => ({ ...prev, isEmergencyMode: false }));
      }
    }

    // Biometric shortcuts
    if (alt && key === 'f') {
      event.preventDefault();
      // Trigger fingerprint capture
      if (isDeviceReady) {
        // Simulate fingerprint capture
        const mockFingerprint = {
          type: 'thumb',
          data: 'mock_fingerprint_data',
          quality: 85,
        };
        handleFieldChange('biometricData', {
          ...formData.biometricData,
          fingerprints: [mockFingerprint],
        });
      }
    }
    if (alt && key === 'p') {
      event.preventDefault();
      // Trigger photo capture
      if (isDeviceReady) {
        handleFieldChange('biometricData', {
          ...formData.biometricData,
          facialImage: 'mock_facial_image_data',
        });
      }
    }

    // Help shortcuts
    if (key === 'f1') {
      event.preventDefault();
      setShowKeyboardShortcuts(true);
    }
    if (ctrl && key === '/') {
      event.preventDefault();
      setShowKeyboardShortcuts(true);
    }
    if (key === 'escape') {
      event.preventDefault();
      setShowEmergencyDialog(false);
      setShowDuplicateDialog(false);
      setShowKeyboardShortcuts(false);
    }
  };

  // Options for dropdowns
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
  ];

  // Allergy severity levels
  const allergySeverityLevels = [
    { value: 'mild', label: 'Mild', color: 'warning', icon: '⚠️' },
    { value: 'moderate', label: 'Moderate', color: 'error', icon: '🚨' },
    { value: 'severe', label: 'Severe', color: 'error', icon: '💀' },
    { value: 'life_threatening', label: 'Life-threatening', color: 'error', icon: '⚡' },
  ];

  // Common allergies for quick selection
  const commonAllergies = [
    'Penicillin', 'Amoxicillin', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
    'Latex', 'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish',
    'Shellfish', 'Dairy', 'Gluten', 'Sulfa Drugs', 'Tetracycline', 'Erythromycin',
    'Cephalosporins', 'Sulfonamides', 'NSAIDs', 'ACE Inhibitors', 'Beta Blockers',
    'Insulin', 'Vaccines', 'Contrast Dye', 'Bee Stings', 'Dust Mites', 'Pollen',
    'Mold', 'Pet Dander', 'Grass', 'Ragweed'
  ];

  const addressTypes = [
    { value: 'permanent', label: 'Permanent Address', icon: <Home /> },
    { value: 'current', label: 'Current Address', icon: <LocationOn /> },
    { value: 'office', label: 'Office Address', icon: <Work /> },
  ];

  // Get validation summary
  const getValidationSummary = () => {
    const summary = {
      basic: {
        firstName: !!formData.firstName && formData.firstName.trim().length >= 2,
        age: !!(formData.age || formData.dateOfBirth),
        gender: !!formData.gender,
        mobile: !!formData.mobile && formData.mobile.trim().length > 0,
      },
      address: {
        address: !!formData.addresses?.[0]?.address && formData.addresses[0].address.trim().length > 0,
        pinCode: !!formData.addresses?.[0]?.pinCode && formData.addresses[0].pinCode.trim().length > 0,
      },
      biometric: {
        captured: !!(formData.biometricData?.fingerprints?.length || formData.biometricData?.facialImage),
        consent: !!formData.biometricData?.consentGiven,
      },
      consents: {
        biometric: !!formData.consents?.biometric,
        treatment: !!formData.consents?.treatment,
      },
    };

    return summary;
  };

  const validationSummary = getValidationSummary();

  // Check if all required fields are completed
  const isFormComplete = () => {
    // Check basic information
    const basicComplete = validationSummary.basic.firstName && 
                         validationSummary.basic.age && 
                         validationSummary.basic.gender && 
                         validationSummary.basic.mobile;
    
    // Check address information
    const addressComplete = validationSummary.address.address && 
                           validationSummary.address.pinCode;
    
    // Check biometric information (only if not in emergency mode)
    const biometricComplete = formData.isEmergencyMode ? true : 
                             (validationSummary.biometric.captured && validationSummary.biometric.consent);
    
    // Check consents
    const consentsComplete = validationSummary.consents.biometric && 
                            validationSummary.consents.treatment;
    
    return basicComplete && addressComplete && biometricComplete && consentsComplete;
  };

  const formComplete = isFormComplete();

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formData, formComplete, isSubmitting, isDeviceReady]);

  useEffect(() => {
    setRegistrationStartTime(Date.now());
    setRegistrationMode(formData.isEmergencyMode ? 'emergency' : 'standard');
  }, [formData.isEmergencyMode, setRegistrationMode]);

  useEffect(() => {
    if (formData.isEmergencyMode) {
      setEmergencyMode();
    } else {
      setStandardMode();
    }
  }, [formData.isEmergencyMode]);

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

  // Handle field changes
  const handleFieldChange = (field, value) => {
    console.log('Field change:', field, value);
    
    setFormData(prev => {
      let updatedData;
      
      // Handle nested object updates
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      // Handle array updates
      else if (field.includes('[') && field.includes(']')) {
        const [parent, indexStr] = field.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        const updatedArray = [...(prev[parent] || [])];
        updatedArray[index] = value;
        updatedData = {
          ...prev,
          [parent]: updatedArray
        };
      }
      // Handle simple field updates
      else {
        updatedData = { ...prev, [field]: value };
      }
      
      // Auto-populate age from date of birth
      if (field === 'dateOfBirth' && value) {
        const calculatedAge = calculateAge(value);
        updatedData.age = calculatedAge;
      }

      // Auto-populate address from PIN code
      if (field === 'pinCode' && value.length === 6) {
        const pinInfo = getPinCodeInfo(value);
        if (pinInfo) {
          updatedData.addresses[0].state = pinInfo.state;
          updatedData.addresses[0].district = pinInfo.district;
          updatedData.addresses[0].subDistrict = pinInfo.subDistrict;
        }
      }
      
      console.log('Updated form data:', updatedData);
      return updatedData;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle address updates
  const updateAddress = (index, field, value) => {
    const updatedAddresses = formData.addresses.map((addr, i) => {
      if (i === index) {
        const updated = { ...addr, [field]: value };
        
        // If setting as primary, unset others
        if (field === 'isPrimary' && value === true) {
          return updated;
        }
        return updated;
      }
      // Unset primary for other addresses if this one is being set as primary
      if (field === 'isPrimary' && value === true) {
        return { ...addr, isPrimary: false };
      }
      return addr;
    });
    
    handleFieldChange('addresses', updatedAddresses);
  };

  // Add new address
  const addAddress = () => {
    const newAddress = {
      type: 'current',
      address: '',
      pinCode: '',
      state: '',
      district: '',
      subDistrict: '',
      city: '',
      isPrimary: false,
    };
    const updatedAddresses = [...formData.addresses, newAddress];
    handleFieldChange('addresses', updatedAddresses);
  };

  // Remove address
  const removeAddress = (index) => {
    if (formData.addresses.length > 1) {
      const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
      handleFieldChange('addresses', updatedAddresses);
    }
  };

  // Handle biometric consent
  const handleBiometricConsentChange = (event) => {
    const consent = event.target.checked;
    setBiometricConsent(consent);
    handleFieldChange('biometricData', {
      ...formData.biometricData,
      consentGiven: consent,
    });
  };

  // Handle consent changes
  const handleConsentChange = (consentType, value) => {
    setFormData(prev => ({
      ...prev,
      consents: {
        ...prev.consents,
        [consentType]: value,
      },
    }));
  };

  // Allergy management functions
  const addAllergy = () => {
    const newAllergy = {
      id: Date.now(),
      name: '',
      severity: 'mild',
      reaction: '',
      onsetDate: '',
      isActive: true,
      notes: '',
    };
    setFormData(prev => ({
      ...prev,
      allergyDetails: [...prev.allergyDetails, newAllergy],
    }));
  };

  const updateAllergy = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      allergyDetails: prev.allergyDetails.map(allergy =>
        allergy.id === id ? { ...allergy, [field]: value } : allergy
      ),
    }));
  };

  const removeAllergy = (id) => {
    setFormData(prev => ({
      ...prev,
      allergyDetails: prev.allergyDetails.filter(allergy => allergy.id !== id),
    }));
  };

  const getSeverityColor = (severity) => {
    const severityLevel = allergySeverityLevels.find(level => level.value === severity);
    return severityLevel ? severityLevel.color : 'default';
  };

  const getSeverityIcon = (severity) => {
    const severityLevel = allergySeverityLevels.find(level => level.value === severity);
    return severityLevel ? severityLevel.icon : '⚠️';
  };

  // OCR Processing Functions
  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length === 0) {
      toast.error('Please upload valid image or PDF files (max 5MB each)');
      return;
    }

    setUploadedDocuments(prev => [...prev, ...validFiles]);
    setShowOCRDialog(true);
  };

  const processOCR = async (file) => {
    setOcrProcessing(true);
    
    try {
      // Simulate OCR processing with different document types
      const fileName = file.name.toLowerCase();
      let extractedData = {};

      if (fileName.includes('aadhaar')) {
        extractedData = {
          documentType: 'Aadhaar Card',
          name: 'John Doe',
          dateOfBirth: '1990-01-15',
          address: '123 Main Street, New Delhi, Delhi - 110001',
          aadhaarNumber: '1234-5678-9012',
          confidence: 95
        };
      } else if (fileName.includes('pan')) {
        extractedData = {
          documentType: 'PAN Card',
          name: 'JOHN DOE',
          dateOfBirth: '1990-01-15',
          panNumber: 'ABCDE1234F',
          confidence: 92
        };
      } else if (fileName.includes('ration')) {
        extractedData = {
          documentType: 'Ration Card',
          name: 'John Doe',
          address: '123 Main Street, New Delhi, Delhi - 110001',
          familyMembers: ['John Doe', 'Jane Doe', 'Child Doe'],
          confidence: 88
        };
      } else {
        // Generic OCR processing
        extractedData = {
          documentType: 'Unknown Document',
          name: 'Extracted Name',
          dateOfBirth: '1990-01-01',
          address: 'Extracted Address',
          confidence: 75
        };
      }

      // Add processing delay to simulate real OCR
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOcrResults(prev => ({
        ...prev,
        [file.name]: extractedData
      }));

      toast.success(`OCR processing completed for ${file.name}`);
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error(`OCR processing failed for ${file.name}`);
    } finally {
      setOcrProcessing(false);
    }
  };

  const applyOCRResults = (fileName) => {
    const result = ocrResults[fileName];
    if (!result) return;

    // Auto-populate form fields based on OCR results
    if (result.name) {
      const nameParts = result.name.split(' ');
      if (nameParts.length > 0) {
        handleFieldChange('firstName', nameParts[0]);
        if (nameParts.length > 1) {
          handleFieldChange('lastName', nameParts.slice(1).join(' '));
        }
      }
    }

    if (result.dateOfBirth) {
      handleFieldChange('dateOfBirth', result.dateOfBirth);
    }

    if (result.address) {
      // Extract PIN code from address
      const pinCodeMatch = result.address.match(/\d{6}/);
      if (pinCodeMatch) {
        const pinCode = pinCodeMatch[0];
        handleFieldChange('addresses', [{
          ...formData.addresses[0],
          address: result.address,
          pinCode: pinCode
        }]);
      }
    }

    toast.success('OCR data applied to form');
  };

  const removeDocument = (fileName) => {
    setUploadedDocuments(prev => prev.filter(file => file.name !== fileName));
    setOcrResults(prev => {
      const newResults = { ...prev };
      delete newResults[fileName];
      return newResults;
    });
  };

  // Multi-Factor Authentication Functions
  const initiateCriticalUpdate = (fieldName, newValue, updateType = 'minor') => {
    setMfaData({
      biometricVerified: false,
      otpSent: false,
      otpVerified: false,
      documentUploaded: false,
      updateType,
      fieldToUpdate: fieldName,
      newValue,
    });
    setMfaStep(1);
    setShowMFADialog(true);
  };

  const handleBiometricVerification = async () => {
    try {
      // Simulate biometric verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMfaData(prev => ({ ...prev, biometricVerified: true }));
      
      if (mfaData.updateType === 'minor') {
        // Minor updates only need biometric
        applyUpdate();
      } else {
        // Major and critical updates need additional verification
        setMfaStep(2);
        sendOTP();
      }
    } catch (error) {
      toast.error('Biometric verification failed');
    }
  };

  const sendOTP = async () => {
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMfaData(prev => ({ ...prev, otpSent: true }));
      toast.success('OTP sent to registered mobile number');
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOTP = async (otp) => {
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (otp === '123456') { // Mock OTP
        setMfaData(prev => ({ ...prev, otpVerified: true }));
        
        if (mfaData.updateType === 'major') {
          // Major updates need biometric + OTP
          applyUpdate();
        } else if (mfaData.updateType === 'critical') {
          // Critical updates need biometric + OTP + document
          setMfaStep(3);
        }
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      toast.error('OTP verification failed');
    }
  };

  const handleDocumentUploadForMFA = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Simulate document upload and validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMfaData(prev => ({ ...prev, documentUploaded: true }));
        toast.success('Document uploaded successfully');
        
        // Critical updates need all three verifications
        applyUpdate();
      } catch (error) {
        toast.error('Document upload failed');
      }
    }
  };

  const applyUpdate = () => {
    // Apply the update to the form
    handleFieldChange(mfaData.fieldToUpdate, mfaData.newValue);
    
    // Log the update for audit trail
    const updateLog = {
      timestamp: new Date().toISOString(),
      field: mfaData.fieldToUpdate,
      oldValue: formData[mfaData.fieldToUpdate],
      newValue: mfaData.newValue,
      updateType: mfaData.updateType,
      verificationMethods: {
        biometric: mfaData.biometricVerified,
        otp: mfaData.otpVerified,
        document: mfaData.documentUploaded,
      },
    };
    
    console.log('Critical update logged:', updateLog);
    
    toast.success('Update applied successfully');
    setShowMFADialog(false);
    setMfaStep(1);
    setMfaData({
      biometricVerified: false,
      otpSent: false,
      otpVerified: false,
      documentUploaded: false,
      updateType: '',
      fieldToUpdate: '',
      newValue: '',
    });
  };

  const getUpdateType = (fieldName) => {
    const criticalFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
    const majorFields = ['mobile', 'email', 'addresses'];
    
    if (criticalFields.includes(fieldName)) {
      return 'critical';
    } else if (majorFields.includes(fieldName)) {
      return 'major';
    } else {
      return 'minor';
    }
  };

  // Validate form
  const validateForm = () => {
    const formErrors = {};

    // Basic validation
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      formErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.age && !formData.dateOfBirth) {
      formErrors.age = 'Age or date of birth is required';
    }
    if (!formData.gender) {
      formErrors.gender = 'Gender is required';
    }
    if (!formData.mobile || formData.mobile.trim().length === 0) {
      formErrors.mobile = 'Mobile number is required';
    }

    // Address validation
    if (!formData.addresses?.[0]?.address || formData.addresses[0].address.trim().length === 0) {
      formErrors.address = 'Primary address is required';
    }
    if (!formData.addresses?.[0]?.pinCode || formData.addresses[0].pinCode.trim().length === 0) {
      formErrors.pinCode = 'PIN code is required';
    }

    // Biometric validation (only if not in emergency mode)
    if (!formData.isEmergencyMode) {
      if (!formData.biometricData?.fingerprints?.length && !formData.biometricData?.facialImage) {
        formErrors.biometric = 'At least one biometric is required';
      }
      if (!formData.biometricData?.consentGiven) {
        formErrors.consent = 'Biometric consent is required';
      }
    }

    // Consent validation
    if (!formData.consents?.biometric) {
      formErrors.consents = 'Biometric consent is required';
    }
    if (!formData.consents?.treatment) {
      formErrors.consents = 'Treatment consent is required';
    }

    console.log('Validation errors:', formErrors);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form...');
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);
    const totalTime = Date.now() - registrationStartTime;

    try {
      // Check for duplicates
      const duplicates = await checkForDuplicates(formData);
      if (duplicates.length > 0) {
        setDuplicateResults(duplicates);
        setShowDuplicateDialog(true);
        setIsSubmitting(false);
        return;
      }

      // Register patient
      const registeredPatient = await registerPatient(formData, formData.isEmergencyMode);
      
      // Show success message
      console.log('Patient registered successfully:', registeredPatient);
      setIsSuccess(true);
      
      // Reset form
      setFormData(initialFormData);
      setErrors({});
      
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Emergency mode toggle
  const handleEmergencyModeToggle = () => {
    if (formData.isEmergencyMode) {
      // If already in emergency mode, disable it
      setFormData(prev => ({ ...prev, isEmergencyMode: false }));
    } else {
      // If not in emergency mode, show confirmation dialog
      setShowEmergencyDialog(true);
    }
  };

  const confirmEmergencyMode = () => {
    setFormData(prev => ({ ...prev, isEmergencyMode: true }));
    setShowEmergencyDialog(false);
  };

  const renderAllergyManagement = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {translate('patient.allergies', 'Allergies & Sensitivities')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addAllergy}
            size="small"
          >
            {translate('common.addAllergy', 'Add Allergy')}
          </Button>
        </Box>

        {/* Allergy Alert Banner */}
        {formData.allergyDetails.some(allergy => 
          ['severe', 'life_threatening'].includes(allergy.severity) && allergy.isActive
        ) && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            icon={<Warning />}
          >
            <Typography variant="subtitle2" gutterBottom>
              {translate('patient.criticalAllergies', 'Critical Allergies Detected')}
            </Typography>
            <Typography variant="body2">
              {translate('patient.criticalAllergiesWarning', 'Patient has severe or life-threatening allergies. Ensure proper precautions are taken.')}
            </Typography>
          </Alert>
        )}

        {/* Allergy List */}
        {formData.allergyDetails.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {translate('patient.noAllergies', 'No allergies recorded')}
          </Typography>
        ) : (
          <Box sx={{ space: 2 }}>
            {formData.allergyDetails.map((allergy, index) => (
              <Card key={allergy.id} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Grid container spacing={2}>
                        {/* Allergy Name */}
                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            freeSolo
                            options={commonAllergies}
                            value={allergy.name}
                            onChange={(event, newValue) => updateAllergy(allergy.id, 'name', newValue || '')}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={translate('patient.allergyName', 'Allergy Name')}
                                required
                                fullWidth
                                size="small"
                              />
                            )}
                          />
                        </Grid>

                        {/* Severity Level */}
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth size="small" required>
                            <InputLabel>{translate('patient.severity', 'Severity')}</InputLabel>
                            <Select
                              value={allergy.severity}
                              onChange={(e) => updateAllergy(allergy.id, 'severity', e.target.value)}
                              label={translate('patient.severity', 'Severity')}
                            >
                              {allergySeverityLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>{level.icon}</span>
                                    <span>{translate(`allergy.severity.${level.value}`, level.label)}</span>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Active Status */}
                        <Grid item xs={12} md={3}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={allergy.isActive}
                                onChange={(e) => updateAllergy(allergy.id, 'isActive', e.target.checked)}
                                color="primary"
                              />
                            }
                            label={translate('patient.active', 'Active')}
                          />
                        </Grid>

                        {/* Reaction */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={translate('patient.reaction', 'Reaction/Symptoms')}
                            value={allergy.reaction}
                            onChange={(e) => updateAllergy(allergy.id, 'reaction', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>

                        {/* Onset Date */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={translate('patient.onsetDate', 'Onset Date')}
                            type="date"
                            value={allergy.onsetDate}
                            onChange={(e) => updateAllergy(allergy.id, 'onsetDate', e.target.value)}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                          <TextField
                            label={translate('patient.notes', 'Notes')}
                            value={allergy.notes}
                            onChange={(e) => updateAllergy(allergy.id, 'notes', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Remove Button */}
                    <IconButton
                      onClick={() => removeAllergy(allergy.id)}
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <Remove />
                    </IconButton>
                  </Box>

                  {/* Severity Indicator */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    p: 1,
                    bgcolor: `${getSeverityColor(allergy.severity)}.light`,
                    borderRadius: 1,
                    border: 1,
                    borderColor: `${getSeverityColor(allergy.severity)}.main`
                  }}>
                    <Typography variant="h6">{getSeverityIcon(allergy.severity)}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {translate(`allergy.severity.${allergy.severity}`, 
                        allergySeverityLevels.find(level => level.value === allergy.severity)?.label
                      )}
                    </Typography>
                    {!allergy.isActive && (
                      <Chip 
                        label={translate('patient.inactive', 'Inactive')} 
                        size="small" 
                        color="default"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Allergy Summary */}
        {formData.allergyDetails.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {translate('patient.allergySummary', 'Allergy Summary')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.allergyDetails
                .filter(allergy => allergy.isActive)
                .map((allergy) => (
                  <Chip
                    key={allergy.id}
                    label={`${allergy.name} (${allergy.severity})`}
                    color={getSeverityColor(allergy.severity)}
                    icon={<span>{getSeverityIcon(allergy.severity)}</span>}
                    size="small"
                  />
                ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderKeyboardShortcutsDialog = () => (
    <Dialog
      open={showKeyboardShortcuts}
      onClose={() => setShowKeyboardShortcuts(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {translate('common.keyboardShortcuts', 'Keyboard Shortcuts')}
          </Typography>
          <IconButton onClick={() => setShowKeyboardShortcuts(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              {translate('common.navigation', 'Navigation')}
            </Typography>
            <List dense>
              {Object.entries(keyboardShortcuts)
                .filter(([key]) => key.startsWith('Alt +'))
                .map(([key, description]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={key} size="small" color="primary" variant="outlined" />
                          <Typography variant="body2">{description}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              {translate('common.formActions', 'Form Actions')}
            </Typography>
            <List dense>
              {Object.entries(keyboardShortcuts)
                .filter(([key]) => key.startsWith('Ctrl +'))
                .map(([key, description]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={key} size="small" color="secondary" variant="outlined" />
                          <Typography variant="body2">{description}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              {translate('common.emergencyMode', 'Emergency Mode')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Alt + E" size="small" color="error" variant="outlined" />
                      <Typography variant="body2">Toggle Emergency Mode</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Ctrl + E" size="small" color="error" variant="outlined" />
                      <Typography variant="body2">Enable Emergency Mode</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Ctrl + N" size="small" color="error" variant="outlined" />
                      <Typography variant="body2">Disable Emergency Mode</Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              {translate('common.biometric', 'Biometric')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Alt + F" size="small" color="info" variant="outlined" />
                      <Typography variant="body2">Capture Fingerprint</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Alt + P" size="small" color="info" variant="outlined" />
                      <Typography variant="body2">Capture Photo</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Alt + I" size="small" color="info" variant="outlined" />
                      <Typography variant="body2">Capture Iris</Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              {translate('common.help', 'Help')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="F1" size="small" color="warning" variant="outlined" />
                      <Typography variant="body2">Show Help</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Ctrl + /" size="small" color="warning" variant="outlined" />
                      <Typography variant="body2">Show Keyboard Shortcuts</Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label="Esc" size="small" color="warning" variant="outlined" />
                      <Typography variant="body2">Close Dialogs/Cancel</Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowKeyboardShortcuts(false)}>
          {translate('common.close', 'Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderOCRDialog = () => (
    <Dialog
      open={showOCRDialog}
      onClose={() => setShowOCRDialog(false)}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {translate('common.ocrProcessing', 'OCR Document Processing')}
          </Typography>
          <IconButton onClick={() => setShowOCRDialog(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Document Upload Section */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translate('common.uploadDocuments', 'Upload Documents')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {translate('common.uploadDocumentsDescription', 'Upload Aadhaar Card, PAN Card, or Ration Card for automatic data extraction')}
                </Typography>
                
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="document-upload"
                  multiple
                  type="file"
                  onChange={handleDocumentUpload}
                />
                <label htmlFor="document-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Add />}
                    sx={{ mb: 2 }}
                  >
                    {translate('common.selectDocuments', 'Select Documents')}
                  </Button>
                </label>

                {/* Uploaded Documents List */}
                {uploadedDocuments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {translate('common.uploadedDocuments', 'Uploaded Documents')}
                    </Typography>
                    <List dense>
                      {uploadedDocuments.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => removeDocument(file.name)}
                              color="error"
                              size="small"
                            >
                              <Remove />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* OCR Processing Section */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {translate('common.ocrResults', 'OCR Processing Results')}
                </Typography>
                
                {ocrProcessing && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">
                      {translate('common.processingDocuments', 'Processing documents...')}
                    </Typography>
                  </Box>
                )}

                {Object.keys(ocrResults).length === 0 && !ocrProcessing && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {translate('common.noDocumentsProcessed', 'No documents processed yet')}
                  </Typography>
                )}

                {/* OCR Results */}
                {Object.entries(ocrResults).map(([fileName, result]) => (
                  <Card key={fileName} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {fileName}
                        </Typography>
                        <Chip
                          label={`${result.confidence}% Confidence`}
                          color={result.confidence >= 90 ? 'success' : result.confidence >= 75 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {result.documentType}
                      </Typography>

                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {result.name && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                              <strong>{translate('common.name', 'Name')}:</strong> {result.name}
                            </Typography>
                          </Grid>
                        )}
                        {result.dateOfBirth && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                              <strong>{translate('common.dateOfBirth', 'Date of Birth')}:</strong> {result.dateOfBirth}
                            </Typography>
                          </Grid>
                        )}
                        {result.address && (
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              <strong>{translate('common.address', 'Address')}:</strong> {result.address}
                            </Typography>
                          </Grid>
                        )}
                        {result.aadhaarNumber && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                              <strong>{translate('common.aadhaarNumber', 'Aadhaar Number')}:</strong> {result.aadhaarNumber}
                            </Typography>
                          </Grid>
                        )}
                        {result.panNumber && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2">
                              <strong>{translate('common.panNumber', 'PAN Number')}:</strong> {result.panNumber}
                            </Typography>
                          </Grid>
                        )}
                        {result.familyMembers && (
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              <strong>{translate('common.familyMembers', 'Family Members')}:</strong> {result.familyMembers.join(', ')}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => applyOCRResults(fileName)}
                          disabled={result.confidence < 75}
                        >
                          {translate('common.applyToForm', 'Apply to Form')}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => processOCR(uploadedDocuments.find(f => f.name === fileName))}
                        >
                          {translate('common.reprocess', 'Reprocess')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowOCRDialog(false)}>
          {translate('common.close', 'Close')}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            // Process all uploaded documents
            uploadedDocuments.forEach(file => {
              if (!ocrResults[file.name]) {
                processOCR(file);
              }
            });
          }}
          disabled={ocrProcessing || uploadedDocuments.length === 0}
        >
          {translate('common.processAll', 'Process All Documents')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderMFADialog = () => (
    <Dialog
      open={showMFADialog}
      onClose={() => setShowMFADialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {translate('common.multiFactorAuth', 'Multi-Factor Authentication')}
          </Typography>
          <IconButton onClick={() => setShowMFADialog(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {translate('common.updateType', 'Update Type')}: {translate(`common.updateType.${mfaData.updateType}`, mfaData.updateType)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translate('common.fieldToUpdate', 'Field')}: {translate(`patient.${mfaData.fieldToUpdate}`, mfaData.fieldToUpdate)}
          </Typography>
        </Box>

        {/* Step Indicator */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {translate('common.verificationSteps', 'Verification Steps')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="1"
              color={mfaStep >= 1 ? 'primary' : 'default'}
              variant={mfaData.biometricVerified ? 'filled' : 'outlined'}
            />
            <Typography variant="body2">→</Typography>
            <Chip
              label="2"
              color={mfaStep >= 2 ? 'primary' : 'default'}
              variant={mfaData.otpVerified ? 'filled' : 'outlined'}
              disabled={mfaData.updateType === 'minor'}
            />
            <Typography variant="body2">→</Typography>
            <Chip
              label="3"
              color={mfaStep >= 3 ? 'primary' : 'default'}
              variant={mfaData.documentUploaded ? 'filled' : 'outlined'}
              disabled={mfaData.updateType !== 'critical'}
            />
          </Box>
        </Box>

        {/* Step 1: Biometric Verification */}
        {mfaStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {translate('common.step1', 'Step 1')}: {translate('common.biometricVerification', 'Biometric Verification')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {translate('common.biometricVerificationDescription', 'Please provide biometric verification to proceed with the update')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Fingerprint />}
              onClick={handleBiometricVerification}
              fullWidth
              disabled={mfaData.biometricVerified}
            >
              {mfaData.biometricVerified 
                ? translate('common.biometricVerified', 'Biometric Verified') 
                : translate('common.verifyBiometric', 'Verify Biometric')}
            </Button>
          </Box>
        )}

        {/* Step 2: OTP Verification */}
        {mfaStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {translate('common.step2', 'Step 2')}: {translate('common.otpVerification', 'OTP Verification')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {translate('common.otpVerificationDescription', 'Enter the OTP sent to your registered mobile number')}
            </Typography>
            
            {!mfaData.otpSent && (
              <Button
                variant="outlined"
                onClick={sendOTP}
                fullWidth
                sx={{ mb: 2 }}
              >
                {translate('common.sendOTP', 'Send OTP')}
              </Button>
            )}

            {mfaData.otpSent && (
              <TextField
                fullWidth
                label={translate('common.enterOTP', 'Enter OTP')}
                placeholder="123456"
                sx={{ mb: 2 }}
                onChange={(e) => {
                  if (e.target.value.length === 6) {
                    verifyOTP(e.target.value);
                  }
                }}
              />
            )}
          </Box>
        )}

        {/* Step 3: Document Upload */}
        {mfaStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {translate('common.step3', 'Step 3')}: {translate('common.documentUpload', 'Document Upload')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {translate('common.documentUploadDescription', 'Upload supporting document for critical update verification')}
            </Typography>
            
            <input
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              id="mfa-document-upload"
              type="file"
              onChange={handleDocumentUploadForMFA}
            />
            <label htmlFor="mfa-document-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<Add />}
                fullWidth
                disabled={mfaData.documentUploaded}
              >
                {mfaData.documentUploaded 
                  ? translate('common.documentUploaded', 'Document Uploaded') 
                  : translate('common.uploadDocument', 'Upload Document')}
              </Button>
            </label>
          </Box>
        )}

        {/* Progress Summary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {translate('common.verificationProgress', 'Verification Progress')}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {mfaData.biometricVerified ? <CheckCircle color="success" /> : <Error color="error" />}
              <Typography variant="body2">
                {translate('common.biometricVerification', 'Biometric Verification')}
              </Typography>
            </Box>
            {mfaData.updateType !== 'minor' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mfaData.otpVerified ? <CheckCircle color="success" /> : <Error color="error" />}
                <Typography variant="body2">
                  {translate('common.otpVerification', 'OTP Verification')}
                </Typography>
              </Box>
            )}
            {mfaData.updateType === 'critical' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mfaData.documentUploaded ? <CheckCircle color="success" /> : <Error color="error" />}
                <Typography variant="body2">
                  {translate('common.documentUpload', 'Document Upload')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowMFADialog(false)}>
          {translate('common.cancel', 'Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {formData.isEmergencyMode ? translate('patient.emergency') : translate('patient.registration')}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isEmergencyMode}
                  onChange={handleEmergencyModeToggle}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospital color="error" />
                  {formData.isEmergencyMode ? 'Disable Emergency Mode' : 'Emergency Mode'}
                </Box>
              }
            />
            
            <Tooltip title={translate('common.keyboardShortcuts', 'Keyboard Shortcuts')}>
              <IconButton
                onClick={() => setShowKeyboardShortcuts(true)}
                color="primary"
                size="small"
              >
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Emergency Mode Alert */}
        {formData.isEmergencyMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Emergency mode: Only essential fields are required. Additional information can be added later.
          </Alert>
        )}

        {/* Registration Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" />
                      {translate('patient.basicInformation', 'Basic Information')}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setShowOCRDialog(true)}
                      size="small"
                    >
                      {translate('common.uploadDocuments', 'Upload Documents')}
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="First Name *"
                        value={formData.firstName}
                        onChange={(e) => handleFieldChange('firstName', e.target.value)}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        required
                        disabled={formData.isEmergencyMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
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
                        disabled={formData.isEmergencyMode}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => handleFieldChange('lastName', e.target.value)}
                        disabled={formData.isEmergencyMode}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        disabled={formData.isEmergencyMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Age *"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleFieldChange('age', e.target.value)}
                        error={!!errors.age}
                        helperText={errors.age}
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

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required error={!!errors.gender}>
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

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number *"
                        value={formData.mobile}
                        onChange={(e) => handleFieldChange('mobile', e.target.value)}
                        error={!!errors.mobile}
                        helperText={errors.mobile}
                        required
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
                        label="Alternate Mobile"
                        value={formData.alternateMobile}
                        onChange={(e) => handleFieldChange('alternateMobile', e.target.value)}
                        disabled={formData.isEmergencyMode}
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
                        disabled={formData.isEmergencyMode}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Extended Demographics Section */}
            {!formData.isEmergencyMode && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Extended Demographics
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Occupation"
                          value={formData.occupation}
                          onChange={(e) => handleFieldChange('occupation', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Education"
                          value={formData.education}
                          onChange={(e) => handleFieldChange('education', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Religion"
                          value={formData.religion}
                          onChange={(e) => handleFieldChange('religion', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Caste"
                          value={formData.caste}
                          onChange={(e) => handleFieldChange('caste', e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Marital Status</InputLabel>
                          <Select
                            value={formData.maritalStatus}
                            onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                            label="Marital Status"
                          >
                            {maritalStatusOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nationality"
                          value={formData.nationality}
                          onChange={(e) => handleFieldChange('nationality', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Address Management Section */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" />
                    Address Management
                  </Typography>
                  
                  {errors.address && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.address}
                    </Alert>
                  )}

                  <List>
                    {formData.addresses.map((address, index) => (
                      <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                        <Card variant="outlined" sx={{ width: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {addressTypes.find(t => t.value === address.type)?.icon}
                                <Typography variant="h6">
                                  {addressTypes.find(t => t.value === address.type)?.label}
                                </Typography>
                                {address.isPrimary && (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Primary"
                                    color="primary"
                                    size="small"
                                  />
                                )}
                              </Box>
                              {formData.addresses.length > 1 && (
                                <IconButton
                                  onClick={() => removeAddress(index)}
                                  color="error"
                                  size="small"
                                >
                                  <Remove />
                                </IconButton>
                              )}
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Address Type</InputLabel>
                                  <Select
                                    value={address.type}
                                    onChange={(e) => updateAddress(index, 'type', e.target.value)}
                                    label="Address Type"
                                  >
                                    {addressTypes.map((type) => (
                                      <MenuItem key={type.value} value={type.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {type.icon}
                                          {type.label}
                                        </Box>
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>

                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  label="PIN Code"
                                  value={address.pinCode}
                                  onChange={(e) => updateAddress(index, 'pinCode', e.target.value)}
                                  placeholder="6-digit PIN code"
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Address"
                                  multiline
                                  rows={2}
                                  value={address.address}
                                  onChange={(e) => updateAddress(index, 'address', e.target.value)}
                                  placeholder="Complete address"
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="State"
                                  value={address.state}
                                  onChange={(e) => updateAddress(index, 'state', e.target.value)}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="District"
                                  value={address.district}
                                  onChange={(e) => updateAddress(index, 'district', e.target.value)}
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="City"
                                  value={address.city}
                                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                                />
                              </Grid>

                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={address.isPrimary}
                                      onChange={(e) => updateAddress(index, 'isPrimary', e.target.checked)}
                                    />
                                  }
                                  label="Set as primary address"
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    startIcon={<Add />}
                    onClick={addAddress}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Add Another Address
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Medical Information Section */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital color="primary" />
                    {translate('patient.medicalInformation', 'Medical Information')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>{translate('patient.bloodGroup', 'Blood Group')}</InputLabel>
                        <Select
                          value={formData.bloodGroup}
                          onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                          label={translate('patient.bloodGroup', 'Blood Group')}
                        >
                          {bloodGroups.map((group) => (
                            <MenuItem key={group.value} value={group.value}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                color: group.isNegative ? 'error.main' : 'inherit'
                              }}>
                                <Bloodtype />
                                <span>{group.label}</span>
                                {group.isNegative && <Warning color="error" />}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={translate('patient.medicalHistory', 'Medical History')}
                        value={formData.medicalHistory}
                        onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                        multiline
                        rows={3}
                        placeholder={translate('patient.medicalHistoryPlaceholder', 'Enter any relevant medical history...')}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={translate('patient.medications', 'Current Medications')}
                        value={formData.medications}
                        onChange={(e) => handleFieldChange('medications', e.target.value)}
                        multiline
                        rows={3}
                        placeholder={translate('patient.medicationsPlaceholder', 'List current medications...')}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={translate('patient.chronicConditions', 'Chronic Conditions')}
                        value={formData.chronicConditions.join(', ')}
                        onChange={(e) => handleFieldChange('chronicConditions', e.target.value.split(',').map(s => s.trim()))}
                        multiline
                        rows={3}
                        placeholder={translate('patient.chronicConditionsPlaceholder', 'Enter chronic conditions separated by commas...')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Allergies Section */}
            <Grid item xs={12}>
              {renderAllergyManagement()}
            </Grid>

            {/* Biometric Enrollment Section */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Fingerprint color="primary" />
                    Biometric Enrollment
                  </Typography>
                  
                  {errors.biometric && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.biometric}
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Fingerprint Capture
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Fingerprint />}
                        onClick={() => {
                          // Simulate fingerprint capture
                          const mockFingerprint = {
                            type: 'thumb',
                            data: 'mock_fingerprint_data',
                            quality: 85,
                          };
                          handleFieldChange('biometricData', {
                            ...formData.biometricData,
                            fingerprints: [mockFingerprint],
                          });
                        }}
                        disabled={!isDeviceReady}
                        sx={{ mb: 2 }}
                      >
                        Capture Fingerprint
                      </Button>
                      
                      {formData.biometricData.fingerprints.length > 0 && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Fingerprint captured successfully
                        </Alert>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Facial Image Capture
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={() => {
                          // Simulate facial capture
                          handleFieldChange('biometricData', {
                            ...formData.biometricData,
                            facialImage: 'mock_facial_image_data',
                          });
                        }}
                        disabled={!isDeviceReady}
                        sx={{ mb: 2 }}
                      >
                        Capture Photo
                      </Button>
                      
                      {formData.biometricData.facialImage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Facial image captured successfully
                        </Alert>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={biometricConsent}
                            onChange={handleBiometricConsentChange}
                            color="primary"
                          />
                        }
                        label="I consent to the collection, storage, and use of my biometric data for identification purposes"
                      />
                      {errors.consent && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {errors.consent}
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Consent Management Section */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security color="primary" />
                    Consent Management
                  </Typography>
                  
                  {errors.consents && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.consents}
                    </Alert>
                  )}

                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.consents.biometric}
                          onChange={(e) => handleConsentChange('biometric', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Biometric Data Collection Consent"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.consents.treatment}
                          onChange={(e) => handleConsentChange('treatment', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Treatment Consent"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.consents.dataSharing}
                          onChange={(e) => handleConsentChange('dataSharing', e.target.checked)}
                        />
                      }
                      label="Data Sharing Consent (Optional)"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.consents.research}
                          onChange={(e) => handleConsentChange('research', e.target.checked)}
                        />
                      }
                      label="Research Participation Consent (Optional)"
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Validation Summary */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="primary" />
                  Form Completion Status
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Basic Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.basic.firstName ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">First Name</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.basic.age ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Age/Date of Birth</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.basic.gender ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Gender</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.basic.mobile ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Mobile Number</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Address Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.address.address ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Primary Address</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.address.pinCode ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">PIN Code</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {!formData.isEmergencyMode && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Biometric Information
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validationSummary.biometric.captured ? <CheckCircle color="success" /> : <Error color="error" />}
                          <Typography variant="body2">Biometric Captured</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validationSummary.biometric.consent ? <CheckCircle color="success" /> : <Error color="error" />}
                          <Typography variant="body2">Biometric Consent</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Required Consents
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.consents.biometric ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Biometric Consent</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {validationSummary.consents.treatment ? <CheckCircle color="success" /> : <Error color="error" />}
                        <Typography variant="body2">Treatment Consent</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Overall Status */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Overall Form Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formComplete ? (
                      <>
                        <CheckCircle color="success" />
                        <Typography variant="body2" color="success.main">
                          {translate('common.formComplete', 'All required fields are completed. You can submit the form.')}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Error color="error" />
                        <Typography variant="body2" color="error.main">
                          {translate('common.formIncomplete', 'Please complete all required fields marked with errors above.')}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Buttons */}
          <Box sx={{ display: 'flex', justifyContent: formData.isEmergencyMode ? 'center' : 'space-between', mt: 3 }}>
            {!formData.isEmergencyMode && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(initialFormData);
                  setErrors({});
                  setIsSuccess(false);
                }}
                startIcon={<Cancel />}
              >
                Reset Form
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !formComplete}
              startIcon={isSubmitting ? <Timer /> : <Save />}
              size="large"
              color={formData.isEmergencyMode ? "error" : (formComplete ? "primary" : "error")}
              sx={formData.isEmergencyMode ? { minWidth: 200 } : {}}
            >
              {isSubmitting ? translate('common.registeringPatient', 'Registering Patient...') : 
               formData.isEmergencyMode ? translate('common.quickRegisterPatient', 'Quick Register Patient') :
               !formComplete ? translate('common.completeRequiredFields', 'Complete Required Fields') : translate('common.registerPatient', 'Register Patient')}
            </Button>
          </Box>

          {/* Validation Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix the following errors before submitting:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <Typography variant="body2">
                      <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {error}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Form Completion Status */}
          {!formComplete && Object.keys(errors).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {translate('common.formStatus', 'Form Completion Status')}
              </Typography>
              <Typography variant="body2">
                {translate('common.formIncomplete', 'Please complete all required fields to enable form submission.')}
              </Typography>
            </Alert>
          )}

          {/* Success Message */}
          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Patient Registration Successful!
              </Typography>
              <Typography variant="body2">
                The patient has been registered successfully. You can now proceed with other operations.
              </Typography>
            </Alert>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errors.submit}
            </Alert>
          )}
        </Box>
      </Paper>

      {/* Emergency Mode Confirmation Dialog */}
      <Dialog open={showEmergencyDialog} onClose={() => setShowEmergencyDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospital color="error" />
            Enable Emergency Mode
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Emergency mode will:
          </Typography>
          <ul>
            <li>Reduce required fields to minimum</li>
            <li>Lower biometric quality thresholds</li>
            <li>Skip non-essential steps</li>
            <li>Prioritize speed over completeness</li>
          </ul>
          <Typography variant="body2" color="warning.main">
            This mode is designed for critical situations only.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmergencyDialog(false)}>Cancel</Button>
          <Button onClick={confirmEmergencyMode} color="error" variant="contained">
            Enable Emergency Mode
          </Button>
        </DialogActions>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      {renderKeyboardShortcutsDialog()}

      {/* OCR Processing Dialog */}
      {renderOCRDialog()}

      {/* Multi-Factor Authentication Dialog */}
      {renderMFADialog()}
    </Box>
  );
};

export default EnhancedPatientRegistration; 