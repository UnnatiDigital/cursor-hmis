import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  CreditCard,
  Add,
  Remove,
  CheckCircle,
} from '@mui/icons-material';

const InsuranceInformationStep = ({ formData, errors, onFieldChange }) => {
  const [insurancePolicies, setInsurancePolicies] = useState(formData.insurancePolicies || []);

  const insuranceProviders = [
    'Government Health Insurance',
    'Private Health Insurance',
    'Corporate Insurance',
    'Ayushman Bharat',
    'CGHS',
    'ESIC',
    'Other'
  ];

  const coverageTypes = [
    'Individual',
    'Family',
    'Group',
    'Corporate',
    'Government'
  ];

  const addInsurance = () => {
    const newPolicy = {
      id: Date.now(),
      provider: '',
      policyNumber: '',
      expiryDate: '',
      coverageType: '',
      isActive: true,
    };
    const updatedPolicies = [...insurancePolicies, newPolicy];
    setInsurancePolicies(updatedPolicies);
    onFieldChange('insurancePolicies', updatedPolicies);
  };

  const removeInsurance = (index) => {
    const updatedPolicies = insurancePolicies.filter((_, i) => i !== index);
    setInsurancePolicies(updatedPolicies);
    onFieldChange('insurancePolicies', updatedPolicies);
  };

  const updateInsurance = (index, field, value) => {
    const updatedPolicies = insurancePolicies.map((policy, i) => 
      i === index ? { ...policy, [field]: value } : policy
    );
    setInsurancePolicies(updatedPolicies);
    onFieldChange('insurancePolicies', updatedPolicies);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Insurance Information
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add insurance policies for billing and claims processing.
      </Typography>

      <List>
        {insurancePolicies.map((policy, index) => (
          <ListItem key={policy.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard color="primary" />
                    <Typography variant="h6">
                      Policy {index + 1}
                    </Typography>
                    {policy.isActive && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                  <IconButton
                    onClick={() => removeInsurance(index)}
                    color="error"
                    size="small"
                  >
                    <Remove />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Insurance Provider</InputLabel>
                      <Select
                        value={policy.provider}
                        onChange={(e) => updateInsurance(index, 'provider', e.target.value)}
                        label="Insurance Provider"
                      >
                        {insuranceProviders.map((provider) => (
                          <MenuItem key={provider} value={provider}>
                            {provider}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Policy Number"
                      value={policy.policyNumber}
                      onChange={(e) => updateInsurance(index, 'policyNumber', e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      type="date"
                      value={policy.expiryDate}
                      onChange={(e) => updateInsurance(index, 'expiryDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Coverage Type</InputLabel>
                      <Select
                        value={policy.coverageType}
                        onChange={(e) => updateInsurance(index, 'coverageType', e.target.value)}
                        label="Coverage Type"
                      >
                        {coverageTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      <Button
        startIcon={<Add />}
        onClick={addInsurance}
        variant="outlined"
        sx={{ mt: 1 }}
      >
        Add Insurance Policy
      </Button>
    </Box>
  );
};

export default InsuranceInformationStep; 