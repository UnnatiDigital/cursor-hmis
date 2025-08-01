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
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  LocationOn,
  Add,
  Remove,
  Home,
  Work,
  LocalHospital,
  CheckCircle,
} from '@mui/icons-material';

const AddressManagementStep = ({ formData, errors, onFieldChange }) => {
  // Use formData.addresses directly instead of local state
  const addresses = formData.addresses || [{
    type: 'permanent',
    address: '',
    pinCode: '',
    state: '',
    district: '',
    subDistrict: '',
    city: '',
    isPrimary: true,
  }];

  const addressTypes = [
    { value: 'permanent', label: 'Permanent Address', icon: <Home /> },
    { value: 'current', label: 'Current Address', icon: <LocationOn /> },
    { value: 'office', label: 'Office Address', icon: <Work /> },
    { value: 'emergency', label: 'Emergency Contact', icon: <LocalHospital /> },
  ];

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
    const updatedAddresses = [...addresses, newAddress];
    onFieldChange('addresses', updatedAddresses);
  };

  const removeAddress = (index) => {
    if (addresses.length > 1) {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      onFieldChange('addresses', updatedAddresses);
    }
  };

  const updateAddress = (index, field, value) => {
    const updatedAddresses = addresses.map((addr, i) => {
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
    
    onFieldChange('addresses', updatedAddresses);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Address Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        You can add multiple addresses for different purposes.
      </Typography>

      <List>
        {addresses.map((address, index) => (
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
                        icon={<CheckCircle />}
                        label="Primary"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  {addresses.length > 1 && (
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
    </Box>
  );
};

export default AddressManagementStep; 