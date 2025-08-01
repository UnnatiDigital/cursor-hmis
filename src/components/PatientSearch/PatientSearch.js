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
  ListItemSecondaryAction,
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
  Slider,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  Search,
  Fingerprint,
  Face,
  QrCode,
  History,
  Star,
  StarBorder,
  FilterList,
  Clear,
  Person,
  Phone,
  Email, 
  LocationOn,
  Bloodtype,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  Download,
  Print,
  Share,
  Refresh,
  CameraAlt,
  Scanner,
  Settings,
  Tune,
  Save,
  Delete,
  Edit,
  ViewList,
  ViewModule,
  Sort,
  MoreVert,
  Close,
  Add,
  Remove,
} from '@mui/icons-material';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBiometric } from '../../contexts/BiometricContext';
import BiometricCapture from '../BiometricCapture/BiometricCapture';

const PatientSearch = () => {
  const { translate } = useLanguage();
  const { 
    searchPatients, 
    searchByBiometric, 
    searchByUHID, 
    searchByABHA, 
    searchByQRCode,
    addSearchHistory,
    addFavoriteSearch,
    removeFavoriteSearch,
    searchHistory,
    favoriteSearches,
    patients,
  } = usePatient();
  const { captureFingerprint, captureFacialImage } = useBiometric();

  // Search state
  const [searchMethod, setSearchMethod] = useState('demographic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Advanced filters
  const [filters, setFilters] = useState({
    ageRange: [0, 100],
    gender: '',
    bloodGroup: '',
    registrationMode: '',
    dateRange: {
      start: null,
      end: null,
    },
    hasBiometric: false,
    hasAllergies: false,
    hasInsurance: false,
  });

  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBiometricDialog, setShowBiometricDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Search methods
  const searchMethods = [
    { value: 'demographic', label: 'Demographic Search', icon: <Person /> },
    { value: 'biometric', label: 'Biometric Search', icon: <Fingerprint /> },
    { value: 'uhid', label: 'UHID Search', icon: <Search /> },
    { value: 'abha', label: 'ABHA Search', icon: <Fingerprint /> },
    { value: 'qr', label: 'QR Code Search', icon: <QrCode /> },
  ];

  // Handle search method change
  const handleSearchMethodChange = (method) => {
    setSearchMethod(method);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle search query change
  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  // Perform search
  const performSearch = async () => {
    if (!searchQuery.trim() && searchMethod !== 'biometric') {
      return;
    }

    setIsSearching(true);
    
    try {
      let results = [];
      const searchCriteria = {
        method: searchMethod,
        data: searchQuery,
        filters,
      };

      switch (searchMethod) {
        case 'demographic':
          results = await searchPatients(searchCriteria);
          break;
        case 'biometric':
          setShowBiometricDialog(true);
          return;
        case 'uhid':
          results = await searchByUHID(searchQuery);
          break;
        case 'abha':
          results = await searchByABHA(searchQuery);
          break;
        case 'qr':
          setShowQRScanner(true);
          return;
        default:
          results = await searchPatients(searchCriteria);
      }

      setSearchResults(results);

      // Add to search history
      addSearchHistory({
        method: searchMethod,
        query: searchQuery,
        resultsCount: results.length,
        filters: Object.keys(filters).filter(key => filters[key] !== '' && filters[key] !== false),
      });

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle biometric search
  const handleBiometricSearch = async (biometricData) => {
    setShowBiometricDialog(false);
    setIsSearching(true);
    
    try {
      const results = await searchByBiometric(biometricData);
      setSearchResults(results);
      
      addSearchHistory({
        method: 'biometric',
        query: 'Biometric search',
        resultsCount: results.length,
        filters: Object.keys(filters).filter(key => filters[key] !== '' && filters[key] !== false),
      });
    } catch (error) {
      console.error('Biometric search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle QR code search
  const handleQRCodeSearch = async (qrData) => {
    setShowQRScanner(false);
    setIsSearching(true);
    
    try {
      const results = await searchByQRCode(qrData);
      setSearchResults(results);
      
      addSearchHistory({
        method: 'qr',
        query: 'QR code scan',
        resultsCount: results.length,
        filters: Object.keys(filters).filter(key => filters[key] !== '' && filters[key] !== false),
      });
    } catch (error) {
      console.error('QR code search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      ageRange: [0, 100],
      gender: '',
      bloodGroup: '',
      registrationMode: '',
      dateRange: { start: null, end: null },
      hasBiometric: false,
      hasAllergies: false,
      hasInsurance: false,
    });
  };

  // Add to favorites
  const handleAddToFavorites = () => {
    addFavoriteSearch({
      method: searchMethod,
      query: searchQuery,
      filters,
      resultsCount: searchResults.length,
    });
  };

  // Remove from favorites
  const handleRemoveFromFavorites = (searchId) => {
    removeFavoriteSearch(searchId);
  };

  // Load favorite search
  const loadFavoriteSearch = (favorite) => {
    setSearchMethod(favorite.method);
    setSearchQuery(favorite.query);
    setFilters(favorite.filters);
    performSearch();
  };

  // Export results
  const exportResults = (format) => {
    const data = searchResults.map(patient => ({
      UHID: patient.uhid,
      Name: `${patient.firstName} ${patient.lastName}`,
      Age: patient.age,
      Gender: patient.gender,
      Mobile: patient.mobile,
      Address: patient.address,
      BloodGroup: patient.bloodGroup,
      RegistrationDate: patient.registrationDate,
    }));

    if (format === 'csv') {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_search_results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  // Sort results
  const sortResults = (results) => {
    return results.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Render search method tabs
  const renderSearchMethodTabs = () => (
    <Tabs
      value={searchMethod}
      onChange={(e, newValue) => handleSearchMethodChange(newValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 3 }}
    >
      {searchMethods.map((method) => (
        <Tab
          key={method.value}
          value={method.value}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {method.icon}
              {method.label}
            </Box>
          }
        />
      ))}
    </Tabs>
  );

  // Render search input
  const renderSearchInput = () => {
    switch (searchMethod) {
      case 'demographic':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by name, mobile, email, or address..."
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={performSearch}
                disabled={isSearching || !searchQuery.trim()}
                fullWidth
                startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        );

      case 'biometric':
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Capture biometric data to search for matching patients
            </Typography>
            <Button
              variant="contained"
              startIcon={<Fingerprint />}
              onClick={() => setShowBiometricDialog(true)}
              fullWidth
              size="large"
            >
              Capture Biometric for Search
            </Button>
          </Box>
        );

      case 'uhid':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Enter UHID (e.g., 2024-HOSP-1234567)"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={performSearch}
                disabled={isSearching || !searchQuery.trim()}
                fullWidth
                startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
              >
                {isSearching ? 'Searching...' : 'Search UHID'}
              </Button>
            </Grid>
          </Grid>
        );

      case 'abha':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Enter ABHA ID (14-digit number or address-based format)"
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Fingerprint />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={performSearch}
                disabled={isSearching || !searchQuery.trim()}
                fullWidth
                startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
              >
                {isSearching ? 'Searching...' : 'Search ABHA'}
              </Button>
            </Grid>
          </Grid>
        );

      case 'qr':
        return (
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Scan QR code to quickly access patient information
            </Typography>
            <Button
              variant="contained"
              startIcon={<QrCode />}
              onClick={() => setShowQRScanner(true)}
              fullWidth
              size="large"
            >
              Scan QR Code
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  // Render advanced filters
  const renderAdvancedFilters = () => (
    <Accordion expanded={showAdvancedFilters} onChange={() => setShowAdvancedFilters(!showAdvancedFilters)}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          <Typography>Advanced Filters</Typography>
          {Object.values(filters).some(value => value !== '' && value !== false && !Array.isArray(value)) && (
            <Badge badgeContent={1} color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography gutterBottom>Age Range</Typography>
            <Slider
              value={filters.ageRange}
              onChange={(e, newValue) => handleFilterChange('ageRange', newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={100}
            />
            <Typography variant="caption">
              {filters.ageRange[0]} - {filters.ageRange[1]} years
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={filters.bloodGroup}
                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                label="Blood Group"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Registration Mode</InputLabel>
              <Select
                value={filters.registrationMode}
                onChange={(e) => handleFilterChange('registrationMode', e.target.value)}
                label="Registration Mode"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasBiometric}
                    onChange={(e) => handleFilterChange('hasBiometric', e.target.checked)}
                  />
                }
                label="Has Biometric Data"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasAllergies}
                    onChange={(e) => handleFilterChange('hasAllergies', e.target.checked)}
                  />
                }
                label="Has Allergies"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.hasInsurance}
                    onChange={(e) => handleFilterChange('hasInsurance', e.target.checked)}
                  />
                }
                label="Has Insurance"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                onClick={performSearch}
                startIcon={<Search />}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Render search results
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No patients found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      );
    }

    const sortedResults = sortResults(searchResults);

    return (
      <Box>
        {/* Results header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {sortedResults.length} patient{sortedResults.length !== 1 ? 's' : ''} found
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Add to favorites">
              <IconButton onClick={handleAddToFavorites}>
                <StarBorder />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export results">
              <IconButton onClick={() => exportResults('csv')}>
                <Download />
              </IconButton>
            </Tooltip>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
              >
                <MenuItem value="name">Sort by Name</MenuItem>
                <MenuItem value="age">Sort by Age</MenuItem>
                <MenuItem value="registrationDate">Sort by Date</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              <Sort sx={{ transform: sortOrder === 'desc' ? 'scaleY(-1)' : 'none' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Results list */}
        <List>
          {sortedResults.map((patient) => (
            <Card key={patient.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          UHID: {patient.uhid}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2">
                      <strong>Age:</strong> {patient.age} years
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {patient.gender}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2">
                      <strong>Mobile:</strong> {patient.mobile}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Blood Group:</strong> {patient.bloodGroup}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2">
                      <strong>Address:</strong> {patient.address}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Registration:</strong> {new Date(patient.registrationDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {patient.registrationMode === 'emergency' && (
                        <Chip label="Emergency" color="error" size="small" />
                      )}
                      {patient.biometricData && (
                        <Chip label="Biometric" color="primary" size="small" />
                      )}
                      {patient.allergies && patient.allergies.length > 0 && (
                        <Chip label="Allergies" color="warning" size="small" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </List>
      </Box>
    );
  };

  // Render search history
  const renderSearchHistory = () => (
    <List>
      {searchHistory.slice(0, 10).map((search, index) => (
        <ListItem key={index} button onClick={() => loadFavoriteSearch(search)}>
          <ListItemAvatar>
            <Avatar>
              {search.method === 'biometric' ? <Fingerprint /> :
               search.method === 'qr' ? <QrCode /> :
               search.method === 'uhid' ? <Search /> :
               search.method === 'abha' ? <Fingerprint /> : <Person />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={search.query || `${search.method} search`}
            secondary={`${search.resultsCount} results • ${new Date(search.timestamp).toLocaleString()}`}
          />
        </ListItem>
      ))}
    </List>
  );

  // Render favorite searches
  const renderFavoriteSearches = () => (
    <List>
      {favoriteSearches.map((favorite) => (
        <ListItem key={favorite.id}>
          <ListItemAvatar>
            <Avatar>
              {favorite.method === 'biometric' ? <Fingerprint /> :
               favorite.method === 'qr' ? <QrCode /> :
               favorite.method === 'uhid' ? <Search /> :
               favorite.method === 'abha' ? <Fingerprint /> : <Person />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={favorite.query || `${favorite.method} search`}
            secondary={`${favorite.resultsCount} results • ${new Date(favorite.timestamp).toLocaleString()}`}
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => loadFavoriteSearch(favorite)}>
                <Search />
              </IconButton>
              <IconButton onClick={() => handleRemoveFromFavorites(favorite.id)}>
                <Delete />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {translate('search.patient')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="List view">
              <IconButton 
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid view">
              <IconButton 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search method tabs */}
        {renderSearchMethodTabs()}

        {/* Search input */}
        {renderSearchInput()}

        {/* Advanced filters */}
        {renderAdvancedFilters()}

        {/* Results tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label={`Search Results (${searchResults.length})`} />
            <Tab label={`Search History (${searchHistory.length})`} />
            <Tab label={`Favorites (${favoriteSearches.length})`} />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ mt: 2 }}>
          {currentTab === 0 && renderSearchResults()}
          {currentTab === 1 && renderSearchHistory()}
          {currentTab === 2 && renderFavoriteSearches()}
        </Box>
      </Paper>

      {/* Dialogs */}
      <BiometricCapture
        open={showBiometricDialog}
        onClose={() => setShowBiometricDialog(false)}
        onComplete={handleBiometricSearch}
        isSearchMode={true}
      />

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onClose={() => setShowQRScanner(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Scanner sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              QR Code Scanner
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Position the QR code within the scanner frame
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleQRCodeSearch('mock-qr-data')}
              sx={{ mt: 2 }}
            >
              Simulate QR Scan
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRScanner(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientSearch; 