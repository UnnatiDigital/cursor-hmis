import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const BiometricContext = createContext();

const initialState = {
  devices: [],
  currentDevice: null,
  isCapturing: false,
  captureQuality: 0,
  capturedData: {
    fingerprints: [],
    facialImage: null,
    iris: null,
  },
  qualityThreshold: 60, // NFIQ 2.0 standard
  emergencyQualityThreshold: 40,
  retryCount: 0,
  maxRetries: 3,
  deviceStatus: 'disconnected',
  complianceStatus: 'unknown',
  auditLog: [],
  consentStatus: false,
};

const biometricReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEVICES':
      return { ...state, devices: action.payload };
    
    case 'SET_CURRENT_DEVICE':
      return { ...state, currentDevice: action.payload };
    
    case 'SET_CAPTURING':
      return { ...state, isCapturing: action.payload };
    
    case 'SET_CAPTURE_QUALITY':
      return { ...state, captureQuality: action.payload };
    
    case 'ADD_FINGERPRINT':
      return {
        ...state,
        capturedData: {
          ...state.capturedData,
          fingerprints: [...state.capturedData.fingerprints, action.payload],
        },
      };
    
    case 'SET_FACIAL_IMAGE':
      return {
        ...state,
        capturedData: {
          ...state.capturedData,
          facialImage: action.payload,
        },
      };
    
    case 'SET_IRIS':
      return {
        ...state,
        capturedData: {
          ...state.capturedData,
          iris: action.payload,
        },
      };
    
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    
    case 'SET_DEVICE_STATUS':
      return { ...state, deviceStatus: action.payload };
    
    case 'SET_COMPLIANCE_STATUS':
      return { ...state, complianceStatus: action.payload };
    
    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLog: [...state.auditLog, action.payload],
      };
    
    case 'SET_CONSENT_STATUS':
      return { ...state, consentStatus: action.payload };
    
    case 'CLEAR_CAPTURED_DATA':
      return {
        ...state,
        capturedData: {
          fingerprints: [],
          facialImage: null,
          iris: null,
        },
        retryCount: 0,
        captureQuality: 0,
      };
    
    case 'SET_EMERGENCY_MODE':
      return {
        ...state,
        qualityThreshold: state.emergencyQualityThreshold,
      };
    
    case 'SET_STANDARD_MODE':
      return {
        ...state,
        qualityThreshold: 60,
      };
    
    default:
      return state;
  }
};

export const BiometricProvider = ({ children }) => {
  const [state, dispatch] = useReducer(biometricReducer, initialState);

  // Initialize biometric devices
  useEffect(() => {
    initializeDevices();
  }, []);

  const initializeDevices = async () => {
    try {
      // Simulate device detection
      const mockDevices = [
        {
          id: 'mantra-001',
          name: 'Mantra MFS100',
          type: 'fingerprint',
          status: 'connected',
          certified: true,
          manufacturer: 'Mantra Softech',
        },
        {
          id: 'morpho-001',
          name: 'Morpho Safran',
          type: 'fingerprint',
          status: 'connected',
          certified: true,
          manufacturer: 'Morpho',
        },
        {
          id: 'webcam-001',
          name: 'Integrated Webcam',
          type: 'facial',
          status: 'connected',
          certified: false,
          manufacturer: 'Generic',
        },
      ];

      dispatch({ type: 'SET_DEVICES', payload: mockDevices });
      
      if (mockDevices.length > 0) {
        dispatch({ type: 'SET_CURRENT_DEVICE', payload: mockDevices[0] });
        dispatch({ type: 'SET_DEVICE_STATUS', payload: 'connected' });
      }
    } catch (error) {
      console.error('Failed to initialize biometric devices:', error);
      toast.error('Failed to initialize biometric devices');
    }
  };

  const captureFingerprint = async (fingerType = 'thumb') => {
    if (!state.currentDevice || state.currentDevice.type !== 'fingerprint') {
      throw new Error('No fingerprint device available');
    }

    if (state.retryCount >= state.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    dispatch({ type: 'SET_CAPTURING', payload: true });
    
    try {
      // Simulate fingerprint capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate quality assessment
      const quality = Math.random() * 40 + 60; // 60-100 range
      dispatch({ type: 'SET_CAPTURE_QUALITY', payload: quality });
      
      if (quality >= state.qualityThreshold) {
        const fingerprintData = {
          id: `fp_${Date.now()}`,
          fingerType,
          quality,
          timestamp: new Date().toISOString(),
          deviceId: state.currentDevice.id,
          data: CryptoJS.SHA256(`fingerprint_${fingerType}_${Date.now()}`).toString(),
          nfiqScore: Math.floor(quality / 10), // NFIQ score 1-10
        };
        
        dispatch({ type: 'ADD_FINGERPRINT', payload: fingerprintData });
        dispatch({ type: 'RESET_RETRY' });
        
        // Add audit log
        const auditEntry = {
          id: `audit_${Date.now()}`,
          action: 'FINGERPRINT_CAPTURE',
          timestamp: new Date().toISOString(),
          deviceId: state.currentDevice.id,
          quality,
          fingerType,
          success: true,
        };
        dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
        
        toast.success(`Fingerprint captured successfully (Quality: ${quality.toFixed(1)}%)`);
        return fingerprintData;
      } else {
        dispatch({ type: 'INCREMENT_RETRY' });
        throw new Error(`Quality too low: ${quality.toFixed(1)}% (Required: ${state.qualityThreshold}%)`);
      }
    } catch (error) {
      dispatch({ type: 'SET_CAPTURING', payload: false });
      
      // Add audit log for failure
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'FINGERPRINT_CAPTURE',
        timestamp: new Date().toISOString(),
        deviceId: state.currentDevice.id,
        error: error.message,
        success: false,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      throw error;
    } finally {
      dispatch({ type: 'SET_CAPTURING', payload: false });
    }
  };

  const captureFacialImage = async (options = {}) => {
    const { skipLiveness = false, skipICAO = false } = options;
    
    dispatch({ type: 'SET_CAPTURING', payload: true });
    
    try {
      // Simulate facial capture
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate liveness detection (if not skipped)
      if (!skipLiveness) {
        const livenessScore = Math.random() * 30 + 70; // 70-100 range
        if (livenessScore < 80) {
          throw new Error('Liveness detection failed');
        }
      }
      
      // Simulate ICAO compliance check (if not skipped)
      if (!skipICAO) {
        const icaoCompliance = Math.random() > 0.1; // 90% compliance rate
        if (!icaoCompliance) {
          throw new Error('ICAO compliance check failed');
        }
      }
      
      const facialData = {
        id: `face_${Date.now()}`,
        timestamp: new Date().toISOString(),
        deviceId: 'webcam-001',
        data: `data:image/jpeg;base64,${CryptoJS.SHA256(`facial_${Date.now()}`).toString()}`,
        livenessScore: skipLiveness ? null : Math.random() * 30 + 70,
        icaoCompliant: !skipICAO,
        quality: Math.random() * 20 + 80, // 80-100 range
      };
      
      dispatch({ type: 'SET_FACIAL_IMAGE', payload: facialData });
      
      // Add audit log
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'FACIAL_CAPTURE',
        timestamp: new Date().toISOString(),
        deviceId: 'webcam-001',
        livenessScore: facialData.livenessScore,
        icaoCompliant: facialData.icaoCompliant,
        success: true,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      toast.success('Facial image captured successfully');
      return facialData;
    } catch (error) {
      // Add audit log for failure
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'FACIAL_CAPTURE',
        timestamp: new Date().toISOString(),
        deviceId: 'webcam-001',
        error: error.message,
        success: false,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      throw error;
    } finally {
      dispatch({ type: 'SET_CAPTURING', payload: false });
    }
  };

  const captureIris = async () => {
    dispatch({ type: 'SET_CAPTURING', payload: true });
    
    try {
      // Simulate iris capture
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const irisData = {
        id: `iris_${Date.now()}`,
        timestamp: new Date().toISOString(),
        deviceId: 'iris-scanner-001',
        data: CryptoJS.SHA256(`iris_${Date.now()}`).toString(),
        quality: Math.random() * 15 + 85, // 85-100 range
        eye: Math.random() > 0.5 ? 'left' : 'right',
      };
      
      dispatch({ type: 'SET_IRIS', payload: irisData });
      
      // Add audit log
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'IRIS_CAPTURE',
        timestamp: new Date().toISOString(),
        deviceId: 'iris-scanner-001',
        quality: irisData.quality,
        success: true,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      toast.success('Iris captured successfully');
      return irisData;
    } catch (error) {
      // Add audit log for failure
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'IRIS_CAPTURE',
        timestamp: new Date().toISOString(),
        deviceId: 'iris-scanner-001',
        error: error.message,
        success: false,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      throw error;
    } finally {
      dispatch({ type: 'SET_CAPTURING', payload: false });
    }
  };

  const verifyBiometric = async (storedData, capturedData) => {
    try {
      // Simulate biometric verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification logic
      const matchScore = Math.random() * 20 + 80; // 80-100 range
      const isMatch = matchScore > 85;
      
      // Add audit log
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'BIOMETRIC_VERIFICATION',
        timestamp: new Date().toISOString(),
        matchScore,
        isMatch,
        success: true,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      return {
        isMatch,
        matchScore,
        confidence: matchScore / 100,
      };
    } catch (error) {
      // Add audit log for failure
      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: 'BIOMETRIC_VERIFICATION',
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false,
      };
      dispatch({ type: 'ADD_AUDIT_LOG', payload: auditEntry });
      
      throw error;
    }
  };

  const setEmergencyMode = () => {
    dispatch({ type: 'SET_EMERGENCY_MODE' });
    toast.info('Emergency mode activated - reduced quality threshold');
  };

  const setStandardMode = () => {
    dispatch({ type: 'SET_STANDARD_MODE' });
    toast.info('Standard mode activated');
  };

  const clearCapturedData = () => {
    dispatch({ type: 'CLEAR_CAPTURED_DATA' });
  };

  const setConsentStatus = (status) => {
    dispatch({ type: 'SET_CONSENT_STATUS', payload: status });
  };

  const getCapturedData = () => {
    return state.capturedData;
  };

  const getAuditLog = () => {
    return state.auditLog;
  };

  const isDeviceReady = () => {
    return state.currentDevice && state.deviceStatus === 'connected';
  };

  const value = {
    ...state,
    captureFingerprint,
    captureFacialImage,
    captureIris,
    verifyBiometric,
    setEmergencyMode,
    setStandardMode,
    clearCapturedData,
    setConsentStatus,
    getCapturedData,
    getAuditLog,
    isDeviceReady,
  };

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
};

export const useBiometric = () => {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometric must be used within a BiometricProvider');
  }
  return context;
}; 