import React, { useState } from 'react';
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
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Bloodtype,
  Warning,
  CheckCircle,
  Error,
  Add,
  Remove,
  Info,
  MedicalServices,
  LocalHospital,
} from '@mui/icons-material';
import { usePatient } from '../../../contexts/PatientContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const MedicalInformationStep = ({ formData, errors, onFieldChange }) => {
  const { translate, currentLanguage } = useLanguage();
  const { bloodGroups, validationRules } = usePatient();

  const [allergies, setAllergies] = useState(formData.allergies || []);
  const [chronicConditions, setChronicConditions] = useState(formData.chronicConditions || []);

  // Common allergies for quick selection
  const commonAllergies = [
    'Penicillin',
    'Sulfa Drugs',
    'Aspirin',
    'Ibuprofen',
    'Latex',
    'Peanuts',
    'Shellfish',
    'Eggs',
    'Milk',
    'Dairy',
    'Wheat',
    'Soy',
  ];

  // Common chronic conditions
  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Arthritis',
    'Cancer',
    'Kidney Disease',
    'Liver Disease',
    'Thyroid Disorder',
    'Depression',
    'Anxiety',
    'Epilepsy',
  ];

  // Handle blood group change with Rh-negative indicator (AC 1.1.3)
  const handleBloodGroupChange = (value) => {
    onFieldChange('bloodGroup', value);
  };

  // Add new allergy with severity (AC 1.1.4)
  const addAllergy = () => {
    const newAllergy = {
      id: Date.now(),
      name: '',
      severity: 'mild',
      reaction: '',
      isActive: true,
    };
    const updatedAllergies = [...allergies, newAllergy];
    setAllergies(updatedAllergies);
    onFieldChange('allergies', updatedAllergies);
  };

  // Remove allergy
  const removeAllergy = (index) => {
    const updatedAllergies = allergies.filter((_, i) => i !== index);
    setAllergies(updatedAllergies);
    onFieldChange('allergies', updatedAllergies);
  };

  // Update allergy field
  const updateAllergy = (index, field, value) => {
    const updatedAllergies = allergies.map((allergy, i) => 
      i === index ? { ...allergy, [field]: value } : allergy
    );
    setAllergies(updatedAllergies);
    onFieldChange('allergies', updatedAllergies);
  };

  // Add chronic condition
  const addChronicCondition = () => {
    const newCondition = {
      id: Date.now(),
      name: '',
      diagnosisDate: '',
      isActive: true,
      medications: '',
    };
    const updatedConditions = [...chronicConditions, newCondition];
    setChronicConditions(updatedConditions);
    onFieldChange('chronicConditions', updatedConditions);
  };

  // Remove chronic condition
  const removeChronicCondition = (index) => {
    const updatedConditions = chronicConditions.filter((_, i) => i !== index);
    setChronicConditions(updatedConditions);
    onFieldChange('chronicConditions', updatedConditions);
  };

  // Update chronic condition field
  const updateChronicCondition = (index, field, value) => {
    const updatedConditions = chronicConditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    setChronicConditions(updatedConditions);
    onFieldChange('chronicConditions', updatedConditions);
  };

  // Check if allergies have required severity
  const validateAllergies = () => {
    return allergies.every(allergy => 
      allergy.name && allergy.severity && allergy.reaction
    );
  };

  // Get blood group color (AC 1.1.3)
  const getBloodGroupColor = (bloodGroup) => {
    const group = bloodGroups.find(bg => bg.value === bloodGroup);
    return group?.isNegative ? 'error' : 'primary';
  };

  // Render blood group section
  const renderBloodGroupSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Bloodtype color="primary" />
          <Typography variant="h6">Blood Group Information</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={formData.bloodGroup}
                onChange={(e) => handleBloodGroupChange(e.target.value)}
                label="Blood Group"
              >
                {bloodGroups.map((group) => (
                  <MenuItem key={group.value} value={group.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{ 
                          color: group.isNegative ? 'error.main' : 'inherit',
                          fontWeight: group.isNegative ? 'bold' : 'normal'
                        }}
                      >
                        {group.label}
                      </Typography>
                      {group.isNegative && (
                        <Chip
                          label="Rh-"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {formData.bloodGroup && (
            <Grid item xs={12} md={6}>
              <Alert 
                severity={getBloodGroupColor(formData.bloodGroup) === 'error' ? 'warning' : 'info'}
                icon={getBloodGroupColor(formData.bloodGroup) === 'error' ? <Warning /> : <Info />}
              >
                <Typography variant="body2">
                  {getBloodGroupColor(formData.bloodGroup) === 'error' 
                    ? 'Rh-negative blood group detected. Special attention required for transfusions.'
                    : 'Standard blood group. No special requirements.'
                  }
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  // Render allergies section
  const renderAllergiesSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Warning color="primary" />
          <Typography variant="h6">Allergies & Sensitivities</Typography>
          {allergies.length > 0 && (
            <Chip
              icon={<Warning />}
              label={`${allergies.length} Allergy${allergies.length > 1 ? 'ies' : ''}`}
              color="warning"
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please list all known allergies, including medications, foods, and environmental factors.
        </Typography>

        {/* Common allergies quick add */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Common Allergies (Click to add):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonAllergies.map((allergy) => (
              <Chip
                key={allergy}
                label={allergy}
                variant="outlined"
                size="small"
                onClick={() => {
                  if (!allergies.some(a => a.name === allergy)) {
                    addAllergy();
                    setTimeout(() => {
                      const lastIndex = allergies.length;
                      updateAllergy(lastIndex, 'name', allergy);
                    }, 100);
                  }
                }}
                disabled={allergies.some(a => a.name === allergy)}
              />
            ))}
          </Box>
        </Box>

        {/* Allergy list */}
        <List>
          {allergies.map((allergy, index) => (
            <ListItem key={allergy.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Allergy Name"
                      value={allergy.name}
                      onChange={(e) => updateAllergy(index, 'name', e.target.value)}
                      size="small"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small" required>
                      <InputLabel>Severity</InputLabel>
                      <Select
                        value={allergy.severity}
                        onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                        label="Severity"
                      >
                        <MenuItem value="mild">Mild</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="severe">Severe</MenuItem>
                        <MenuItem value="life-threatening">Life-threatening</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Reaction/Symptoms"
                      value={allergy.reaction}
                      onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                      size="small"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allergy.isActive}
                          onChange={(e) => updateAllergy(index, 'isActive', e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton
                      onClick={() => removeAllergy(index)}
                      color="error"
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            </ListItem>
          ))}
        </List>

        <Button
          startIcon={<Add />}
          onClick={addAllergy}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add Allergy
        </Button>

        {/* Allergy validation */}
        {allergies.length > 0 && !validateAllergies() && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Please complete all required fields for allergies (name, severity, and reaction).
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Render chronic conditions section
  const renderChronicConditionsSection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocalHospital color="primary" />
          <Typography variant="h6">Chronic Conditions</Typography>
          {chronicConditions.length > 0 && (
            <Chip
              label={`${chronicConditions.length} Condition${chronicConditions.length > 1 ? 's' : ''}`}
              color="info"
              size="small"
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please list any chronic medical conditions and current medications.
        </Typography>

        {/* Common conditions quick add */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Common Conditions (Click to add):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {commonConditions.map((condition) => (
              <Chip
                key={condition}
                label={condition}
                variant="outlined"
                size="small"
                onClick={() => {
                  if (!chronicConditions.some(c => c.name === condition)) {
                    addChronicCondition();
                    setTimeout(() => {
                      const lastIndex = chronicConditions.length;
                      updateChronicCondition(lastIndex, 'name', condition);
                    }, 100);
                  }
                }}
                disabled={chronicConditions.some(c => c.name === condition)}
              />
            ))}
          </Box>
        </Box>

        {/* Conditions list */}
        <List>
          {chronicConditions.map((condition, index) => (
            <ListItem key={condition.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Condition Name"
                      value={condition.name}
                      onChange={(e) => updateChronicCondition(index, 'name', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Diagnosis Date"
                      type="date"
                      value={condition.diagnosisDate}
                      onChange={(e) => updateChronicCondition(index, 'diagnosisDate', e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Current Medications"
                      value={condition.medications}
                      onChange={(e) => updateChronicCondition(index, 'medications', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={condition.isActive}
                          onChange={(e) => updateChronicCondition(index, 'isActive', e.target.checked)}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton
                      onClick={() => removeChronicCondition(index)}
                      color="error"
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            </ListItem>
          ))}
        </List>

        <Button
          startIcon={<Add />}
          onClick={addChronicCondition}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add Condition
        </Button>
      </CardContent>
    </Card>
  );

  // Render medical history section
  const renderMedicalHistorySection = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MedicalServices color="primary" />
          <Typography variant="h6">Medical History</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medical History"
              multiline
              rows={4}
              value={formData.medicalHistory}
              onChange={(e) => onFieldChange('medicalHistory', e.target.value)}
              placeholder="Please provide any relevant medical history, surgeries, hospitalizations, etc."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Medications"
              multiline
              rows={3}
              value={formData.medications}
              onChange={(e) => onFieldChange('medications', e.target.value)}
              placeholder="List all current medications, dosages, and frequency"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Medical Information
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This information helps healthcare providers provide better care and avoid potential complications.
      </Typography>

      {renderBloodGroupSection()}
      {renderAllergiesSection()}
      {renderChronicConditionsSection()}
      {renderMedicalHistorySection()}

      {/* Summary */}
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Medical Information Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Blood Group:</Typography>
              <Typography variant="body2">
                {formData.bloodGroup || 'Not specified'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Allergies:</Typography>
              <Typography variant="body2">
                {allergies.length} recorded
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Chronic Conditions:</Typography>
              <Typography variant="body2">
                {chronicConditions.length} recorded
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2">Medical History:</Typography>
              <Typography variant="body2">
                {formData.medicalHistory ? 'Provided' : 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.medical && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.medical}
        </Alert>
      )}
    </Box>
  );
};

export default MedicalInformationStep; 