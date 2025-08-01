import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Work,
  School,
  Religion,
  Person,
} from '@mui/icons-material';

const ExtendedDemographicsStep = ({ formData, errors, onFieldChange }) => {
  const educationLevels = [
    'No Formal Education',
    'Primary School',
    'Secondary School',
    'Higher Secondary',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Other'
  ];

  const maritalStatuses = [
    'Single',
    'Married',
    'Divorced',
    'Widowed',
    'Separated',
    'Other'
  ];

  const religions = [
    'Hinduism',
    'Islam',
    'Christianity',
    'Sikhism',
    'Buddhism',
    'Jainism',
    'Other',
    'No Religion'
  ];

  const languages = [
    'Hindi',
    'English',
    'Bengali',
    'Telugu',
    'Marathi',
    'Tamil',
    'Gujarati',
    'Kannada',
    'Odia',
    'Malayalam',
    'Punjabi',
    'Other'
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Extended Demographics
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Additional demographic information helps provide better healthcare services.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Occupation"
            value={formData.occupation}
            onChange={(e) => onFieldChange('occupation', e.target.value)}
            InputProps={{
              startAdornment: <Work />,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Education Level</InputLabel>
            <Select
              value={formData.education}
              onChange={(e) => onFieldChange('education', e.target.value)}
              label="Education Level"
            >
              {educationLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Religion</InputLabel>
            <Select
              value={formData.religion}
              onChange={(e) => onFieldChange('religion', e.target.value)}
              label="Religion"
            >
              {religions.map((religion) => (
                <MenuItem key={religion} value={religion}>
                  {religion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Caste"
            value={formData.caste}
            onChange={(e) => onFieldChange('caste', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Marital Status</InputLabel>
            <Select
              value={formData.maritalStatus}
              onChange={(e) => onFieldChange('maritalStatus', e.target.value)}
              label="Marital Status"
            >
              {maritalStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
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
            onChange={(e) => onFieldChange('nationality', e.target.value)}
            defaultValue="Indian"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Mother Tongue</InputLabel>
            <Select
              value={formData.motherTongue}
              onChange={(e) => onFieldChange('motherTongue', e.target.value)}
              label="Mother Tongue"
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Language</InputLabel>
            <Select
              value={formData.preferredLanguage}
              onChange={(e) => onFieldChange('preferredLanguage', e.target.value)}
              label="Preferred Language"
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExtendedDemographicsStep; 