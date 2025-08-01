import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  FamilyRestroom,
} from '@mui/icons-material';

const FamilyManagementStep = ({ formData, errors, onFieldChange }) => {
  const relationshipTypes = [
    'Self', 'Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister',
    'Grandfather', 'Grandmother', 'Grandson', 'Granddaughter', 'Uncle', 'Aunt',
    'Nephew', 'Niece', 'Cousin', 'Guardian', 'Caregiver', 'Other'
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Family Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Family information helps in better healthcare coordination and emergency contacts.
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FamilyRestroom color="primary" />
            <Typography variant="h6">Family Information</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Family ID"
                value={formData.familyId}
                onChange={(e) => onFieldChange('familyId', e.target.value)}
                placeholder="Auto-generated family identifier"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Family Role</InputLabel>
                <Select
                  value={formData.familyRole}
                  onChange={(e) => onFieldChange('familyRole', e.target.value)}
                  label="Family Role"
                >
                  {relationshipTypes.map((relationship) => (
                    <MenuItem key={relationship} value={relationship}>
                      {relationship}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={formData.emergencyContact?.name}
                onChange={(e) => onFieldChange('emergencyContact', {
                  ...formData.emergencyContact,
                  name: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Mobile"
                value={formData.emergencyContact?.mobile}
                onChange={(e) => onFieldChange('emergencyContact', {
                  ...formData.emergencyContact,
                  mobile: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact Address"
                multiline
                rows={2}
                value={formData.emergencyContact?.address}
                onChange={(e) => onFieldChange('emergencyContact', {
                  ...formData.emergencyContact,
                  address: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FamilyManagementStep; 