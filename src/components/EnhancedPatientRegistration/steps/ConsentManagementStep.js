import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
} from '@mui/material';
import {
  Security,
  PrivacyTip,
  Gavel,
} from '@mui/icons-material';

const ConsentManagementStep = ({ formData, errors, onFieldChange }) => {
  const handleConsentChange = (consentType, value) => {
    onFieldChange('consents', {
      ...formData.consents,
      [consentType]: value,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Consent Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Please review and provide consent for various healthcare activities.
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6">Required Consents</Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consents?.biometric || false}
                onChange={(e) => handleConsentChange('biometric', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Biometric Data Collection
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  I consent to the collection, storage, and use of my biometric data for identification purposes.
                </Typography>
              </Box>
            }
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consents?.treatment || false}
                onChange={(e) => handleConsentChange('treatment', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Treatment Consent
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  I consent to receive medical treatment and care as recommended by healthcare providers.
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PrivacyTip color="primary" />
            <Typography variant="h6">Optional Consents</Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consents?.dataSharing || false}
                onChange={(e) => handleConsentChange('dataSharing', e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Data Sharing with Healthcare Providers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allow sharing of my health information with other healthcare providers for better care coordination.
                </Typography>
              </Box>
            }
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consents?.research || false}
                onChange={(e) => handleConsentChange('research', e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Research Participation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allow my anonymized data to be used for healthcare research and system improvements.
                </Typography>
              </Box>
            }
          />

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.consents?.emergency || false}
                onChange={(e) => handleConsentChange('emergency', e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Emergency Contact Authorization
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Allow emergency contacts to be notified in case of medical emergencies.
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {(!formData.consents?.biometric || !formData.consents?.treatment) && (
        <Alert severity="warning">
          <Typography variant="body2">
            Required consents must be provided to proceed with registration.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ConsentManagementStep; 