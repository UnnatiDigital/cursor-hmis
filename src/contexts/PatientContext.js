import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

const PatientContext = createContext();

const initialState = {
  patients: [],
  currentPatient: null,
  searchResults: [],
  isLoading: false,
  error: null,
  auditTrail: [],
  families: [],
  duplicateCheckResults: [],
  registrationMode: 'standard', // 'standard', 'emergency'
  consentRecords: [],
  insurancePolicies: [],
  // Enhanced demographics support
  demographicFields: {
    basic: ['firstName', 'lastName', 'age', 'gender', 'mobile', 'email'],
    extended: ['occupation', 'education', 'religion', 'caste', 'maritalStatus'],
    medical: ['bloodGroup', 'allergies', 'medicalHistory', 'medications'],
    insurance: ['policyNumber', 'provider', 'expiryDate', 'coverageType'],
    family: ['familyId', 'relationship', 'emergencyContact', 'guardian'],
  },
  // PIN code mapping for auto-population
  pinCodeMapping: {
    '110001': { state: 'Delhi', district: 'New Delhi', subDistrict: 'Connaught Place' },
    '400001': { state: 'Maharashtra', district: 'Mumbai', subDistrict: 'Fort' },
    '600001': { state: 'Tamil Nadu', district: 'Chennai', subDistrict: 'George Town' },
    '700001': { state: 'West Bengal', district: 'Kolkata', subDistrict: 'BBD Bagh' },
    '500001': { state: 'Telangana', district: 'Hyderabad', subDistrict: 'Abids' },
    '560001': { state: 'Karnataka', district: 'Bangalore', subDistrict: 'City Market' },
    '380001': { state: 'Gujarat', district: 'Ahmedabad', subDistrict: 'Ellis Bridge' },
    '302001': { state: 'Rajasthan', district: 'Jaipur', subDistrict: 'Hawa Mahal' },
  },
  // Blood groups with Rh-negative indicators
  bloodGroups: [
    { value: 'A+', label: 'A+', isNegative: false, color: 'inherit' },
    { value: 'A-', label: 'A-', isNegative: true, color: 'red' },
    { value: 'B+', label: 'B+', isNegative: false, color: 'inherit' },
    { value: 'B-', label: 'B-', isNegative: true, color: 'red' },
    { value: 'AB+', label: 'AB+', isNegative: false, color: 'inherit' },
    { value: 'AB-', label: 'AB-', isNegative: true, color: 'red' },
    { value: 'O+', label: 'O+', isNegative: false, color: 'inherit' },
    { value: 'O-', label: 'O-', isNegative: true, color: 'red' },
  ],
  // Family relationship types
  relationshipTypes: [
    'Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister',
    'Grandfather', 'Grandmother', 'Grandson', 'Granddaughter', 'Uncle', 'Aunt',
    'Nephew', 'Niece', 'Cousin', 'Guardian', 'Caregiver', 'Other'
  ],
  // Insurance providers
  insuranceProviders: [
    'Government Health Insurance', 'Private Health Insurance', 'Corporate Insurance',
    'Ayushman Bharat', 'CGHS', 'ESIC', 'Other'
  ],
  // Validation rules
  validationRules: {
    firstName: { min: 2, max: 50, pattern: /^[a-zA-Z\s]+$/ },
    lastName: { min: 0, max: 50, pattern: /^[a-zA-Z\s]*$/ },
    age: { min: 0, max: 150 },
    mobile: { pattern: /^[6-9]\d{9}$/ },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    pinCode: { pattern: /^\d{6}$/ },
  },
  // Registration statistics
  registrationStats: {
    totalRegistrations: 0,
    emergencyRegistrations: 0,
    duplicateAlerts: 0,
    biometricFailures: 0,
  },
  // Search history and favorites
  searchHistory: [],
  favoriteSearches: [],
};

const patientReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload],
        currentPatient: action.payload,
        isLoading: false,
      };
    
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentPatient: action.payload,
        isLoading: false,
      };
    
    case 'SET_CURRENT_PATIENT':
      return { ...state, currentPatient: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false };
    
    case 'ADD_AUDIT_ENTRY':
      return {
        ...state,
        auditTrail: [...state.auditTrail, action.payload],
      };
    
    case 'ADD_FAMILY':
      return {
        ...state,
        families: [...state.families, action.payload],
      };
    
    case 'UPDATE_FAMILY':
      return {
        ...state,
        families: state.families.map(f => 
          f.id === action.payload.id ? action.payload : f
        ),
      };
    
    case 'SET_DUPLICATE_RESULTS':
      return { ...state, duplicateCheckResults: action.payload };
    
    case 'SET_REGISTRATION_MODE':
      return { ...state, registrationMode: action.payload };
    
    case 'ADD_CONSENT':
      return {
        ...state,
        consentRecords: [...state.consentRecords, action.payload],
      };
    
    case 'ADD_INSURANCE':
      return {
        ...state,
        insurancePolicies: [...state.insurancePolicies, action.payload],
      };
    
    case 'UPDATE_REGISTRATION_STATS':
      return {
        ...state,
        registrationStats: { ...state.registrationStats, ...action.payload },
      };
    
    case 'ADD_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.slice(0, 49)], // Keep last 50
      };
    
    case 'ADD_FAVORITE_SEARCH':
      return {
        ...state,
        favoriteSearches: [...state.favoriteSearches, action.payload],
      };
    
    case 'REMOVE_FAVORITE_SEARCH':
      return {
        ...state,
        favoriteSearches: state.favoriteSearches.filter(search => search.id !== action.payload),
      };
    
    default:
      return state;
  }
};

export const PatientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  // Load initial data from localStorage
  useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    const savedFamilies = localStorage.getItem('families');
    const savedAuditTrail = localStorage.getItem('auditTrail');
    
    if (savedPatients) {
      try {
        const patients = JSON.parse(savedPatients);
        dispatch({ type: 'SET_PATIENTS', payload: patients });
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    }
    
    if (savedFamilies) {
      try {
        const families = JSON.parse(savedFamilies);
        dispatch({ type: 'SET_FAMILIES', payload: families });
      } catch (error) {
        console.error('Error loading families:', error);
      }
    }
    
    if (savedAuditTrail) {
      try {
        const auditTrail = JSON.parse(savedAuditTrail);
        dispatch({ type: 'SET_AUDIT_TRAIL', payload: auditTrail });
      } catch (error) {
        console.error('Error loading audit trail:', error);
      }
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(state.patients));
  }, [state.patients]);

  useEffect(() => {
    localStorage.setItem('families', JSON.stringify(state.families));
  }, [state.families]);

  useEffect(() => {
    localStorage.setItem('auditTrail', JSON.stringify(state.auditTrail));
  }, [state.auditTrail]);

  const generateUHID = (patientData) => {
    const year = new Date().getFullYear();
    const hospitalCode = 'HOSP';
    const sequence = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const biometricHash = patientData.biometricData ? 
      CryptoJS.SHA256(JSON.stringify(patientData.biometricData)).toString().substring(0, 8) : 
      '00000000';
    
    return `${year}-${hospitalCode}-${sequence}-${biometricHash}`;
  };

  const registerPatient = async (patientData, isEmergency = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Validate patient data based on registration mode
      const validationErrors = validatePatientData(patientData, isEmergency);
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Generate UHID
      const uhid = generateUHID(patientData);
      
      // Create patient object with enhanced data
      const newPatient = {
        id: uuidv4(),
        uhid,
        ...patientData,
        registrationDate: new Date().toISOString(),
        registrationMode: isEmergency ? 'emergency' : 'standard',
        status: 'active',
        version: 1,
        auditTrail: [],
        // Enhanced fields for comprehensive registration
        addresses: patientData.addresses || [],
        allergies: patientData.allergies || [],
        medicalHistory: patientData.medicalHistory || [],
        insurancePolicies: patientData.insurancePolicies || [],
        consentRecords: patientData.consentRecords || [],
        familyMembers: patientData.familyMembers || [],
        lastUpdated: new Date().toISOString(),
      };

      // Check for duplicates (skip for emergency mode)
      const duplicates = await checkForDuplicates(newPatient);
      if (duplicates.length > 0 && !isEmergency) {
        dispatch({ type: 'SET_DUPLICATE_RESULTS', payload: duplicates });
        throw new Error('Potential duplicate patient found');
      }

      // Add audit entry
      const auditEntry = {
        id: uuidv4(),
        patientId: newPatient.id,
        action: 'CREATE',
        timestamp: new Date().toISOString(),
        userId: 'current_user', // In real app, get from auth context
        changes: { 
          type: 'new_registration', 
          data: newPatient,
          registrationMode: newPatient.registrationMode,
          fieldsCaptured: Object.keys(patientData).length,
          biometricData: patientData.biometricData ? 'captured' : 'not_captured',
        },
        verificationMethod: patientData.verificationMethod || 'none',
      };

      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry });
      dispatch({ type: 'ADD_PATIENT', payload: newPatient });

      // Update registration statistics
      dispatch({ 
        type: 'UPDATE_REGISTRATION_STATS', 
        payload: {
          totalRegistrations: state.registrationStats.totalRegistrations + 1,
          emergencyRegistrations: isEmergency 
            ? state.registrationStats.emergencyRegistrations + 1 
            : state.registrationStats.emergencyRegistrations,
        }
      });

      const successMessage = isEmergency 
        ? `Emergency patient registered successfully! UHID: ${uhid}`
        : `Patient registered successfully! UHID: ${uhid}`;
      
      toast.success(successMessage);
      return newPatient;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Registration failed: ' + error.message);
      throw error;
    }
  };

  const updatePatientDemographics = async (patientId, updates, verificationMethod) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const patient = state.patients.find(p => p.id === patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Create audit entry for changes
      const auditEntry = {
        id: uuidv4(),
        patientId,
        action: 'UPDATE',
        timestamp: new Date().toISOString(),
        userId: 'current_user',
        changes: {
          before: { ...patient },
          after: { ...patient, ...updates },
          fieldsChanged: Object.keys(updates),
        },
        verificationMethod,
      };

      const updatedPatient = {
        ...patient,
        ...updates,
        version: patient.version + 1,
        lastUpdated: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry });
      dispatch({ type: 'UPDATE_PATIENT', payload: updatedPatient });

      toast.success('Patient demographics updated successfully');
      return updatedPatient;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Update failed: ' + error.message);
      throw error;
    }
  };

  const searchPatients = async (searchCriteria) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      let results = [...state.patients];

      // Biometric search
      if (searchCriteria.biometricData) {
        results = results.filter(patient => {
          // Simulate biometric matching
          return patient.biometricData && 
                 patient.biometricData.quality > 60 &&
                 Math.random() > 0.3; // Mock matching logic
        });
      }

      // Demographic search
      if (searchCriteria.name) {
        results = results.filter(patient => 
          patient.firstName?.toLowerCase().includes(searchCriteria.name.toLowerCase()) ||
          patient.lastName?.toLowerCase().includes(searchCriteria.name.toLowerCase())
        );
      }

      if (searchCriteria.mobile) {
        results = results.filter(patient => 
          patient.mobile?.includes(searchCriteria.mobile)
        );
      }

      if (searchCriteria.uhid) {
        results = results.filter(patient => 
          patient.uhid?.includes(searchCriteria.uhid)
        );
      }

      if (searchCriteria.ageRange) {
        results = results.filter(patient => 
          patient.age >= searchCriteria.ageRange.min && 
          patient.age <= searchCriteria.ageRange.max
        );
      }

      if (searchCriteria.gender) {
        results = results.filter(patient => 
          patient.gender === searchCriteria.gender
        );
      }

      // Add confidence scores for biometric matches
      if (searchCriteria.biometricData) {
        results = results.map(patient => ({
          ...patient,
          confidenceScore: Math.random() * 20 + 80, // Mock confidence score
        }));
      }

      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
      return results;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Search failed: ' + error.message);
      throw error;
    }
  };

  const checkForDuplicates = async (patientData) => {
    try {
      const duplicates = [];
      
      // Check by mobile number
      const mobileMatch = state.patients.find(p => p.mobile === patientData.mobile);
      if (mobileMatch) {
        duplicates.push({
          type: 'mobile',
          patient: mobileMatch,
          confidence: 95,
        });
      }

      // Check by name + DOB
      const nameDobMatch = state.patients.find(p => 
        p.firstName === patientData.firstName &&
        p.lastName === patientData.lastName &&
        p.dateOfBirth === patientData.dateOfBirth
      );
      if (nameDobMatch) {
        duplicates.push({
          type: 'name_dob',
          patient: nameDobMatch,
          confidence: 85,
        });
      }

      // Check by biometric (if available)
      if (patientData.biometricData) {
        const biometricMatch = state.patients.find(p => 
          p.biometricData && 
          p.biometricData.quality > 60 &&
          Math.random() > 0.7 // Mock biometric matching
        );
        if (biometricMatch) {
          duplicates.push({
            type: 'biometric',
            patient: biometricMatch,
            confidence: 90,
          });
        }
      }

      dispatch({ type: 'SET_DUPLICATE_RESULTS', payload: duplicates });
      return duplicates;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return [];
    }
  };

  const createFamily = async (familyData) => {
    try {
      const family = {
        id: uuidv4(),
        ...familyData,
        createdAt: new Date().toISOString(),
        members: [],
        primaryContact: familyData.primaryContact,
      };

      dispatch({ type: 'ADD_FAMILY', payload: family });
      toast.success('Family created successfully');
      return family;
    } catch (error) {
      toast.error('Failed to create family: ' + error.message);
      throw error;
    }
  };

  const addFamilyMember = async (familyId, memberData) => {
    try {
      const family = state.families.find(f => f.id === familyId);
      if (!family) {
        throw new Error('Family not found');
      }

      if (family.members.length >= 10) {
        throw new Error('Maximum family size limit reached (10 members)');
      }

      const updatedFamily = {
        ...family,
        members: [...family.members, memberData],
      };

      dispatch({ type: 'UPDATE_FAMILY', payload: updatedFamily });
      toast.success('Family member added successfully');
      return updatedFamily;
    } catch (error) {
      toast.error('Failed to add family member: ' + error.message);
      throw error;
    }
  };

  const addConsent = async (patientId, consentData) => {
    try {
      const consent = {
        id: uuidv4(),
        patientId,
        ...consentData,
        timestamp: new Date().toISOString(),
        signature: consentData.signature || null,
        version: '1.0',
      };

      dispatch({ type: 'ADD_CONSENT', payload: consent });
      toast.success('Consent recorded successfully');
      return consent;
    } catch (error) {
      toast.error('Failed to record consent: ' + error.message);
      throw error;
    }
  };

  const addInsurance = async (patientId, insuranceData) => {
    try {
      const insurance = {
        id: uuidv4(),
        patientId,
        ...insuranceData,
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      dispatch({ type: 'ADD_INSURANCE', payload: insurance });
      toast.success('Insurance policy added successfully');
      return insurance;
    } catch (error) {
      toast.error('Failed to add insurance: ' + error.message);
      throw error;
    }
  };

  const getPatientById = (patientId) => {
    return state.patients.find(p => p.id === patientId);
  };

  const getPatientByUHID = (uhid) => {
    return state.patients.find(p => p.uhid === uhid);
  };



  const setRegistrationMode = (mode) => {
    dispatch({ type: 'SET_REGISTRATION_MODE', payload: mode });
  };

  // Enhanced validation function
  const validatePatientData = (data, isEmergency) => {
    const errors = [];
    const rules = state.validationRules;

    // Mandatory fields based on registration mode
    const mandatoryFields = isEmergency 
      ? ['firstName', 'age', 'gender'] 
      : ['firstName', 'age', 'gender', 'mobile', 'address', 'pinCode'];

    mandatoryFields.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    // Field-specific validation
    if (data.firstName && !rules.firstName.pattern.test(data.firstName)) {
      errors.push('First name can only contain letters and spaces');
    }

    if (data.mobile && !rules.mobile.pattern.test(data.mobile)) {
      errors.push('Invalid mobile number format');
    }

    if (data.email && !rules.email.pattern.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.pinCode && !rules.pinCode.pattern.test(data.pinCode)) {
      errors.push('PIN code must be 6 digits');
    }

    // Age validation
    if (data.age && (data.age < rules.age.min || data.age > rules.age.max)) {
      errors.push(`Age must be between ${rules.age.min} and ${rules.age.max}`);
    }

    return errors;
  };

  // PIN code utility function
  const getPinCodeInfo = (pinCode) => {
    return state.pinCodeMapping[pinCode] || null;
  };

  // Registration statistics
  const getRegistrationStats = () => {
    return state.registrationStats;
  };

  // Enhanced search functions
  const searchByBiometric = async (biometricData) => {
    const results = [];
    
    for (const patient of state.patients) {
      if (patient.biometricData) {
        const confidence = compareBiometricData(biometricData, patient.biometricData);
        if (confidence > 0.6) { // Configurable threshold
          results.push({
            ...patient,
            matchConfidence: confidence,
            matchType: 'biometric',
          });
        }
      }
    }

    return results.sort((a, b) => b.matchConfidence - a.matchConfidence);
  };

  const searchByUHID = async (uhid) => {
    return state.patients.filter(patient => patient.uhid === uhid);
  };

  const searchByABHA = async (abhaId) => {
    // Mock ABHA API call
    console.log(`Searching ABHA database for ID: ${abhaId}`);
    return [];
  };

  const searchByQRCode = async (qrData) => {
    try {
      const decodedData = JSON.parse(qrData);
      return state.patients.filter(patient => patient.uhid === decodedData.uhid);
    } catch (error) {
      console.error('Invalid QR code data:', error);
      return [];
    }
  };

  // Biometric comparison utility
  const compareBiometricData = (data1, data2) => {
    // Mock biometric comparison - replace with actual biometric SDK
    return Math.random() * 0.4 + 0.6; // Returns 0.6-1.0
  };

  // Enhanced audit trail
  const getAuditTrail = (filters = {}) => {
    let auditTrail = state.auditTrail;

    if (filters.action) {
      auditTrail = auditTrail.filter(entry => entry.action === filters.action);
    }

    if (filters.dateRange) {
      auditTrail = auditTrail.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= filters.dateRange.start && entryDate <= filters.dateRange.end;
      });
    }

    if (filters.userId) {
      auditTrail = auditTrail.filter(entry => entry.userId === filters.userId);
    }

    return auditTrail.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Search history management
  const addSearchHistory = (search) => {
    dispatch({
      type: 'ADD_SEARCH_HISTORY',
      payload: {
        id: uuidv4(),
        ...search,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const addFavoriteSearch = (search) => {
    dispatch({
      type: 'ADD_FAVORITE_SEARCH',
      payload: {
        id: uuidv4(),
        ...search,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const removeFavoriteSearch = (searchId) => {
    dispatch({ type: 'REMOVE_FAVORITE_SEARCH', payload: searchId });
  };

  const value = {
    ...state,
    registerPatient,
    updatePatientDemographics,
    searchPatients,
    checkForDuplicates,
    createFamily,
    addFamilyMember,
    addConsent,
    addInsurance,
    getPatientById,
    getPatientByUHID,
    getAuditTrail,
    setRegistrationMode,
    // Enhanced functions
    validatePatientData,
    getPinCodeInfo,
    getRegistrationStats,
    searchByBiometric,
    searchByUHID,
    searchByABHA,
    searchByQRCode,
    addSearchHistory,
    addFavoriteSearch,
    removeFavoriteSearch,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}; 