import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Warning,
  Info,
  Clear,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  VerifiedUser,
  Gavel,
  PrivacyTip,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const ConsentForm = ({ open, onClose, onConsent }) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [signature, setSignature] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [witnessSignature, setWitnessSignature] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showWitnessSignature, setShowWitnessSignature] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [signatureCanvas, setSignatureCanvas] = useState(null);
  const [witnessSignatureCanvas, setWitnessSignatureCanvas] = useState(null);
  const canvasRef = useRef(null);
  const witnessCanvasRef = useRef(null);

  const { translate, currentLanguage } = useLanguage();

  const consentSteps = [
    {
      title: 'Consent Overview',
      description: 'Review the consent terms and conditions',
    },
    {
      title: 'Digital Signature',
      description: 'Provide your digital signature',
    },
    {
      title: 'Witness Signature',
      description: 'Optional witness signature for verification',
    },
    {
      title: 'Confirmation',
      description: 'Confirm your consent',
    },
  ];

  const consentTerms = [
    {
      id: 'biometric_collection',
      title: 'Biometric Data Collection',
      description: 'I consent to the collection, storage, and use of my biometric data (fingerprints, facial images) for identification and verification purposes.',
      required: true,
    },
    {
      id: 'data_storage',
      title: 'Data Storage and Security',
      description: 'I understand that my biometric data will be stored securely using encryption and will only be used for healthcare-related identification purposes.',
      required: true,
    },
    {
      id: 'data_sharing',
      title: 'Data Sharing',
      description: 'I consent to the sharing of my biometric data with authorized healthcare providers and government agencies as required by law.',
      required: false,
    },
    {
      id: 'research_participation',
      title: 'Research Participation',
      description: 'I agree to allow my anonymized data to be used for healthcare research and system improvements.',
      required: false,
    },
    {
      id: 'withdrawal_rights',
      title: 'Withdrawal Rights',
      description: 'I understand that I have the right to withdraw my consent at any time, and my data will be deleted within 30 days of withdrawal.',
      required: true,
    },
  ];

  const [selectedTerms, setSelectedTerms] = useState({});

  const handleTermChange = (termId, checked) => {
    setSelectedTerms(prev => ({
      ...prev,
      [termId]: checked,
    }));
  };

  const handleSignatureChange = (event) => {
    setSignature(event.target.value);
  };

  const handleWitnessSignatureChange = (event) => {
    setWitnessSignature(event.target.value);
  };

  const handleNext = () => {
    if (currentStep < consentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Validate required terms
    const requiredTerms = consentTerms.filter(term => term.required);
    const allRequiredAccepted = requiredTerms.every(term => selectedTerms[term.id]);
    
    if (!allRequiredAccepted) {
      return;
    }

    const consentData = {
      terms: selectedTerms,
      signature,
      witnessName,
      witnessSignature,
      timestamp: new Date().toISOString(),
      language: currentLanguage,
      version: '1.0',
    };

    onConsent(consentData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Overview
        const requiredTerms = consentTerms.filter(term => term.required);
        return requiredTerms.every(term => selectedTerms[term.id]);
      case 1: // Signature
        return signature.trim().length > 0;
      case 2: // Witness (optional)
        return true;
      case 3: // Confirmation
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Please carefully review and accept the following consent terms. 
                Required terms are marked with an asterisk (*).
              </Typography>
            </Alert>
            
            <List>
              {consentTerms.map((term) => (
                <ListItem key={term.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedTerms[term.id] || false}
                          onChange={(e) => handleTermChange(term.id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {term.title}
                            {term.required && <span style={{ color: 'red' }}> *</span>}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {term.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', width: '100%' }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Digital Signature
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Please provide your full name as a digital signature to confirm your consent.
            </Typography>
            
            <TextField
              fullWidth
              label="Digital Signature (Full Name)"
              value={signature}
              onChange={handleSignatureChange}
              placeholder="Enter your full name as signature"
              required
              sx={{ mb: 2 }}
            />
            
            <Alert severity="warning">
              <Typography variant="body2">
                By providing your digital signature, you confirm that you have read, 
                understood, and agreed to all the consent terms.
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Witness Signature (Optional)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              You may optionally have a witness sign to verify your consent. 
              This is not required but provides additional verification.
            </Typography>
            
            <TextField
              fullWidth
              label="Witness Name"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              placeholder="Enter witness name (optional)"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Witness Signature"
              value={witnessSignature}
              onChange={handleWitnessSignatureChange}
              placeholder="Enter witness signature (optional)"
              sx={{ mb: 2 }}
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                Witness signature is optional and can be added later if needed.
              </Typography>
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Consent Summary
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Accepted Terms:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.keys(selectedTerms).map((termId) => {
                  const term = consentTerms.find(t => t.id === termId);
                  if (selectedTerms[termId] && term) {
                    return (
                      <Chip
                        key={termId}
                        label={term.title}
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Signature Details:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Digital Signature:</strong> {signature}
              </Typography>
              {witnessName && (
                <Typography variant="body2">
                  <strong>Witness:</strong> {witnessName}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="textSecondary">
                <strong>Timestamp:</strong> {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Language:</strong> {currentLanguage.toUpperCase()}
              </Typography>
            </Paper>
            
            <Alert severity="success">
              <Typography variant="body2">
                Your consent will be recorded and stored securely. 
                You can withdraw your consent at any time through your account settings.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Security color="primary" />
          <Typography variant="h6">
            Biometric Data Consent
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Progress Indicator */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Step {currentStep + 1} of {consentSteps.length}: {consentSteps[currentStep].title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {consentSteps[currentStep].description}
          </Typography>
        </Box>
        
        {/* Step Content */}
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        
        {currentStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        
        {currentStep < consentSteps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={!canProceed()}
            startIcon={<VerifiedUser />}
          >
            Confirm Consent
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConsentForm; 