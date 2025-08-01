import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Warning,
  Person,
  Phone,
  Fingerprint,
  CheckCircle,
  Error,
  Info,
  ExpandMore,
  ExpandLess,
  Visibility,
  Compare,
  Close,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const DuplicateCheckDialog = ({ open, duplicates, onClose, onProceed }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedAction, setSelectedAction] = useState('proceed'); // 'proceed' or 'review'
  
  const { translate } = useLanguage();

  const handleExpandToggle = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDuplicateTypeIcon = (type) => {
    switch (type) {
      case 'mobile':
        return <Phone color="primary" />;
      case 'name_dob':
        return <Person color="secondary" />;
      case 'biometric':
        return <Fingerprint color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  const getDuplicateTypeColor = (type) => {
    switch (type) {
      case 'mobile':
        return 'primary';
      case 'name_dob':
        return 'secondary';
      case 'biometric':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getDuplicateTypeLabel = (type) => {
    switch (type) {
      case 'mobile':
        return 'Mobile Number Match';
      case 'name_dob':
        return 'Name & DOB Match';
      case 'biometric':
        return 'Biometric Match';
      default:
        return 'Potential Match';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'error';
    if (confidence >= 70) return 'warning';
    return 'info';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  const renderPatientDetails = (patient) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>Name:</strong> {patient.firstName} {patient.lastName}
          </Typography>
          <Typography variant="body2">
            <strong>Age:</strong> {patient.age}
          </Typography>
          <Typography variant="body2">
            <strong>Gender:</strong> {patient.gender}
          </Typography>
          <Typography variant="body2">
            <strong>Mobile:</strong> {patient.mobile}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            <strong>UHID:</strong> {patient.uhid}
          </Typography>
          <Typography variant="body2">
            <strong>Registration Date:</strong> {new Date(patient.registrationDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            <strong>Address:</strong> {patient.address}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> 
            <Chip 
              label={patient.status} 
              size="small" 
              color={patient.status === 'active' ? 'success' : 'default'}
              sx={{ ml: 1 }}
            />
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderDuplicateItem = (duplicate, index) => {
    const isExpanded = expandedItems[index];
    const patient = duplicate.patient;

    return (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getDuplicateTypeIcon(duplicate.type)}
              <Typography variant="h6">
                {getDuplicateTypeLabel(duplicate.type)}
              </Typography>
              <Chip
                label={`${duplicate.confidence}% Confidence`}
                color={getConfidenceColor(duplicate.confidence)}
                size="small"
              />
            </Box>
            <IconButton
              onClick={() => handleExpandToggle(index)}
              size="small"
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            {renderPatientDetails(patient)}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => {
                  // Navigate to patient profile
                  console.log('View patient:', patient.id);
                }}
              >
                View Patient
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Compare />}
                onClick={() => {
                  // Compare patients
                  console.log('Compare with patient:', patient.id);
                }}
              >
                Compare
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const getRecommendation = () => {
    const highConfidenceDuplicates = duplicates.filter(d => d.confidence >= 90);
    const mediumConfidenceDuplicates = duplicates.filter(d => d.confidence >= 70 && d.confidence < 90);
    
    if (highConfidenceDuplicates.length > 0) {
      return {
        severity: 'error',
        title: 'High Confidence Duplicates Found',
        message: 'One or more high-confidence duplicates were found. Please review carefully before proceeding.',
        action: 'review',
      };
    } else if (mediumConfidenceDuplicates.length > 0) {
      return {
        severity: 'warning',
        title: 'Potential Duplicates Found',
        message: 'Some potential duplicates were found. Please review before proceeding.',
        action: 'review',
      };
    } else {
      return {
        severity: 'info',
        title: 'Low Confidence Matches',
        message: 'Some low-confidence matches were found. You may proceed with registration.',
        action: 'proceed',
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warning color="warning" />
          <Typography variant="h6">
            Duplicate Check Results
          </Typography>
          <Chip label={`${duplicates.length} potential matches`} color="warning" />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Recommendation Alert */}
        <Alert severity={recommendation.severity} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {recommendation.title}
          </Typography>
          <Typography variant="body2">
            {recommendation.message}
          </Typography>
        </Alert>

        {/* Duplicates List */}
        {duplicates.length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Potential Duplicates:
            </Typography>
            {duplicates.map((duplicate, index) => 
              renderDuplicateItem(duplicate, index)
            )}
          </Box>
        ) : (
          <Alert severity="success">
            No potential duplicates found. You can proceed with registration.
          </Alert>
        )}

        {/* Action Selection */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Recommended Action:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={selectedAction === 'review' ? 'contained' : 'outlined'}
              color="warning"
              startIcon={<Compare />}
              onClick={() => setSelectedAction('review')}
            >
              Review Duplicates
            </Button>
            <Button
              variant={selectedAction === 'proceed' ? 'contained' : 'outlined'}
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => setSelectedAction('proceed')}
            >
              Proceed with Registration
            </Button>
          </Box>
        </Box>

        {/* Additional Information */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Duplicate detection is based on multiple factors including mobile number, 
            name + date of birth, and biometric data. Please review carefully to ensure accurate patient identification.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        
        <Button
          variant="outlined"
          color="warning"
          startIcon={<Compare />}
          onClick={() => {
            // Handle review action
            console.log('Review duplicates');
          }}
        >
          Review All
        </Button>
        
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          onClick={() => {
            onProceed();
            onClose();
          }}
        >
          Proceed with Registration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateCheckDialog; 