import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Person } from '@mui/icons-material';

const PatientProfile = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Patient Profile
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Patient Profile component - This will display detailed patient information, 
        audit trail, and allow updates with biometric verification.
      </Alert>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Person sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h5">
              Patient Profile Management
            </Typography>
          </Box>
          
          <Typography variant="body1" color="textSecondary">
            This component will include:
          </Typography>
          <ul>
            <li>Detailed patient information display</li>
            <li>Biometric-verified demographic updates</li>
            <li>Complete audit trail</li>
            <li>Family relationship management</li>
            <li>Insurance information</li>
            <li>Consent management</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientProfile; 