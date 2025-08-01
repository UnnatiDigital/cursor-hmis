import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  FormGroup,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  FamilyRestroom,
  PersonAdd,
  Person,
  Phone,
  Email,
  LocationOn,
  Edit,
  Delete,
  Add,
  Remove,
  Save,
  Cancel,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Error,
  Warning,
  ExpandMore,
  Security,
  Visibility,
  VisibilityOff,
  Lock,
  Unlock,
  Group,
  SupervisorAccount,
  ChildCare,
  Elderly,
  PregnantWoman,
  Accessibility,
  Fingerprint,
  CameraAlt,
  QrCode,
  Share,
  Settings,
  History,
  Timeline,
  MedicalServices,
  LocalHospital,
  VerifiedUser,
  Block,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBiometric } from '../../contexts/BiometricContext';
import BiometricCapture from '../BiometricCapture/BiometricCapture';

const FamilyManagement = () => {
  const { translate } = useLanguage();
  const { 
    createFamilyGroup,
    addFamilyMember,
    families,
    patients,
    relationshipTypes,
  } = usePatient();
  const { captureFingerprint, captureFacialImage } = useBiometric();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showCreateFamilyDialog, setShowCreateFamilyDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Family creation state
  const [familyData, setFamilyData] = useState({
    name: '',
    primaryContact: '',
    primaryMobile: '',
    address: '',
    pinCode: '',
    state: '',
    district: '',
    description: '',
  });

  // Member addition state
  const [memberData, setMemberData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    relationship: '',
    mobile: '',
    email: '',
    biometricData: null,
    permissions: {
      viewProfile: false,
      bookAppointments: false,
      makePayments: false,
      emergencyAccess: false,
      viewMedicalHistory: false,
    },
  });

  // Batch enrollment state
  const [batchMembers, setBatchMembers] = useState([]);
  const [batchStep, setBatchStep] = useState(0);
  const [currentBatchMember, setCurrentBatchMember] = useState(0);

  // Permission management state
  const [permissionSettings, setPermissionSettings] = useState({});

  // Tabs
  const tabs = [
    { label: 'Family Groups', icon: <Group /> },
    { label: 'Batch Enrollment', icon: <PersonAdd /> },
    { label: 'Permissions', icon: <Security /> },
    { label: 'Family History', icon: <History /> },
  ];

  // Handle family creation
  const handleCreateFamily = async () => {
    setIsProcessing(true);
    
    try {
      const newFamily = await createFamilyGroup(familyData);
      setSelectedFamily(newFamily);
      setShowCreateFamilyDialog(false);
      setFamilyData({
        name: '',
        primaryContact: '',
        primaryMobile: '',
        address: '',
        pinCode: '',
        state: '',
        district: '',
        description: '',
      });
    } catch (error) {
      console.error('Failed to create family:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle member addition
  const handleAddMember = async () => {
    setIsProcessing(true);
    
    try {
      const newMember = await addFamilyMember(selectedFamily.id, memberData);
      setShowAddMemberDialog(false);
      setMemberData({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        relationship: '',
        mobile: '',
        email: '',
        biometricData: null,
        permissions: {
          viewProfile: false,
          bookAppointments: false,
          makePayments: false,
          emergencyAccess: false,
          viewMedicalHistory: false,
        },
      });
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle batch enrollment
  const handleBatchEnrollment = async () => {
    setIsProcessing(true);
    
    try {
      for (let i = 0; i < batchMembers.length; i++) {
        const member = batchMembers[i];
        await addFamilyMember(selectedFamily.id, member);
        setCurrentBatchMember(i + 1);
      }
      
      setBatchMembers([]);
      setBatchStep(0);
      setCurrentBatchMember(0);
    } catch (error) {
      console.error('Batch enrollment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle biometric capture
  const handleBiometricCapture = async () => {
    setShowBiometricDialog(true);
  };

  const handleBiometricComplete = (biometricData) => {
    setMemberData(prev => ({ ...prev, biometricData }));
    setShowBiometricDialog(false);
  };

  // Handle permission changes
  const handlePermissionChange = (memberId, permission, value) => {
    setPermissionSettings(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [permission]: value,
      },
    }));
  };

  // Render family groups
  const renderFamilyGroups = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Family Groups</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateFamilyDialog(true)}
        >
          Create Family Group
        </Button>
      </Box>

      <Grid container spacing={3}>
        {families.map((family) => (
          <Grid item xs={12} md={6} lg={4} key={family.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{family.name}</Typography>
                  <Chip label={`${family.members?.length || 0} members`} size="small" />
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Primary Contact: {family.primaryContact}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Mobile: {family.primaryMobile}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Address: {family.address}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedFamily(family);
                      setShowAddMemberDialog(true);
                    }}
                  >
                    Add Member
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedFamily(family);
                      setActiveTab(1);
                    }}
                  >
                    Batch Enrollment
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedFamily(family);
                      setActiveTab(2);
                    }}
                  >
                    Permissions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render batch enrollment
  const renderBatchEnrollment = () => {
    const steps = ['Family Selection', 'Member Details', 'Biometric Capture', 'Review & Submit'];
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Batch Family Enrollment
        </Typography>
        
        {!selectedFamily ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please select a family group to begin batch enrollment
          </Alert>
        ) : (
          <Box>
            <Stepper activeStep={batchStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {batchStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Selected Family: {selectedFamily.name}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setBatchStep(1)}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Box>
            )}
            
            {batchStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Add Family Members
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Number of Members"
                      type="number"
                      value={batchMembers.length}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        const newMembers = Array(count).fill(null).map(() => ({
                          firstName: '',
                          lastName: '',
                          age: '',
                          gender: '',
                          relationship: '',
                          mobile: '',
                          email: '',
                          biometricData: null,
                        }));
                        setBatchMembers(newMembers);
                      }}
                    />
                  </Grid>
                </Grid>
                
                {batchMembers.map((member, index) => (
                  <Card key={index} sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Member {index + 1}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            value={member?.firstName || ''}
                            onChange={(e) => {
                              const newMembers = [...batchMembers];
                              newMembers[index] = { ...newMembers[index], firstName: e.target.value };
                              setBatchMembers(newMembers);
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            value={member?.lastName || ''}
                            onChange={(e) => {
                              const newMembers = [...batchMembers];
                              newMembers[index] = { ...newMembers[index], lastName: e.target.value };
                              setBatchMembers(newMembers);
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Age"
                            type="number"
                            value={member?.age || ''}
                            onChange={(e) => {
                              const newMembers = [...batchMembers];
                              newMembers[index] = { ...newMembers[index], age: e.target.value };
                              setBatchMembers(newMembers);
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Gender</InputLabel>
                            <Select
                              value={member?.gender || ''}
                              onChange={(e) => {
                                const newMembers = [...batchMembers];
                                newMembers[index] = { ...newMembers[index], gender: e.target.value };
                                setBatchMembers(newMembers);
                              }}
                              label="Gender"
                            >
                              <MenuItem value="male">Male</MenuItem>
                              <MenuItem value="female">Female</MenuItem>
                              <MenuItem value="other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Relationship</InputLabel>
                            <Select
                              value={member?.relationship || ''}
                              onChange={(e) => {
                                const newMembers = [...batchMembers];
                                newMembers[index] = { ...newMembers[index], relationship: e.target.value };
                                setBatchMembers(newMembers);
                              }}
                              label="Relationship"
                            >
                              {relationshipTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Mobile"
                            value={member?.mobile || ''}
                            onChange={(e) => {
                              const newMembers = [...batchMembers];
                              newMembers[index] = { ...newMembers[index], mobile: e.target.value };
                              setBatchMembers(newMembers);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={() => setBatchStep(0)} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setBatchStep(2)}
                    endIcon={<ArrowForward />}
                    disabled={batchMembers.some(member => !member.firstName || !member.age || !member.gender)}
                  >
                    Continue to Biometric
                  </Button>
                </Box>
              </Box>
            )}
            
            {batchStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Biometric Capture
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Capture biometric data for each family member
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Member {currentBatchMember + 1} of {batchMembers.length}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {batchMembers[currentBatchMember]?.firstName} {batchMembers[currentBatchMember]?.lastName}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    startIcon={<Fingerprint />}
                    onClick={handleBiometricCapture}
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Capture Biometric
                  </Button>
                </Box>
              </Box>
            )}
            
            {batchStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review & Submit
                </Typography>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Mobile</TableCell>
                        <TableCell>Biometric</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batchMembers.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell>{member.firstName} {member.lastName}</TableCell>
                          <TableCell>{member.age}</TableCell>
                          <TableCell>{member.gender}</TableCell>
                          <TableCell>{member.relationship}</TableCell>
                          <TableCell>{member.mobile}</TableCell>
                          <TableCell>
                            {member.biometricData ? (
                              <CheckCircle color="success" />
                            ) : (
                              <Error color="error" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={() => setBatchStep(2)} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleBatchEnrollment}
                    disabled={isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={20} /> : <Save />}
                  >
                    {isProcessing ? 'Enrolling...' : 'Complete Enrollment'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render permissions management
  const renderPermissions = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Family Permissions Management
      </Typography>
      
      {selectedFamily ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Family: {selectedFamily.name}
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>View Profile</TableCell>
                  <TableCell>Book Appointments</TableCell>
                  <TableCell>Make Payments</TableCell>
                  <TableCell>Emergency Access</TableCell>
                  <TableCell>View Medical History</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedFamily.members?.map((memberId) => {
                  const member = patients.find(p => p.id === memberId);
                  if (!member) return null;
                  
                  return (
                    <TableRow key={memberId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {member.firstName} {member.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {member.relationship}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {['viewProfile', 'bookAppointments', 'makePayments', 'emergencyAccess', 'viewMedicalHistory'].map((permission) => (
                        <TableCell key={permission}>
                          <Switch
                            checked={permissionSettings[memberId]?.[permission] || false}
                            onChange={(e) => handlePermissionChange(memberId, permission, e.target.checked)}
                            color="primary"
                          />
                        </TableCell>
                      ))}
                      
                      <TableCell>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Alert severity="info">
          Please select a family group to manage permissions
        </Alert>
      )}
    </Box>
  );

  // Render family history
  const renderFamilyHistory = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Family History & Timeline
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonAdd />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="New member added"
                    secondary="John Doe added to Smith family • 2 hours ago"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Fingerprint />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Biometric updated"
                    secondary="Jane Smith biometric data updated • 1 day ago"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Security />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Permissions changed"
                    secondary="Emergency access granted to John Doe • 3 days ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Family Statistics
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Total Members:</Typography>
                <Typography variant="h6">8</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>With Biometric:</Typography>
                <Typography variant="h6">6</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Emergency Contacts:</Typography>
                <Typography variant="h6">3</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Active Permissions:</Typography>
                <Typography variant="h6">12</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {translate('family.management')}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Tab content */}
        <Box>
          {activeTab === 0 && renderFamilyGroups()}
          {activeTab === 1 && renderBatchEnrollment()}
          {activeTab === 2 && renderPermissions()}
          {activeTab === 3 && renderFamilyHistory()}
        </Box>
      </Paper>

      {/* Create Family Dialog */}
      <Dialog open={showCreateFamilyDialog} onClose={() => setShowCreateFamilyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Family Group</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Family Name"
                value={familyData.name}
                onChange={(e) => setFamilyData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Contact"
                value={familyData.primaryContact}
                onChange={(e) => setFamilyData(prev => ({ ...prev, primaryContact: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Mobile"
                value={familyData.primaryMobile}
                onChange={(e) => setFamilyData(prev => ({ ...prev, primaryMobile: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={familyData.address}
                onChange={(e) => setFamilyData(prev => ({ ...prev, address: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PIN Code"
                value={familyData.pinCode}
                onChange={(e) => setFamilyData(prev => ({ ...prev, pinCode: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                value={familyData.description}
                onChange={(e) => setFamilyData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateFamilyDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFamily}
            disabled={isProcessing || !familyData.name || !familyData.primaryContact}
          >
            {isProcessing ? 'Creating...' : 'Create Family'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onClose={() => setShowAddMemberDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Family Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={memberData.firstName}
                onChange={(e) => setMemberData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={memberData.lastName}
                onChange={(e) => setMemberData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={memberData.age}
                onChange={(e) => setMemberData(prev => ({ ...prev, age: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={memberData.gender}
                  onChange={(e) => setMemberData(prev => ({ ...prev, gender: e.target.value }))}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={memberData.relationship}
                  onChange={(e) => setMemberData(prev => ({ ...prev, relationship: e.target.value }))}
                  label="Relationship"
                >
                  {relationshipTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile"
                value={memberData.mobile}
                onChange={(e) => setMemberData(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<Fingerprint />}
                onClick={handleBiometricCapture}
                fullWidth
              >
                Capture Biometric Data
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddMemberDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={isProcessing || !memberData.firstName || !memberData.age || !memberData.gender}
          >
            {isProcessing ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Biometric Capture Dialog */}
      <BiometricCapture
        open={showBiometricDialog}
        onClose={() => setShowBiometricDialog(false)}
        onComplete={handleBiometricComplete}
        isFamilyMode={true}
      />
    </Box>
  );
};

export default FamilyManagement; 