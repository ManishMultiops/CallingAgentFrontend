import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Properties = () => {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'apartment',
    location: '',
    price: '',
    area: '',
    description: '',
    amenities: '',
    images: []
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'plot', label: 'Plot' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office' },
    { value: 'shop', label: 'Shop' }
  ];

  useEffect(() => {
    if (!authLoading && user) {
      fetchProperties();
    }
  }, [user, authLoading]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log('Fetching properties...');
      console.log('Auth token:', localStorage.getItem('access_token'));
      console.log('Axios headers:', axios.defaults.headers.common);
      
      const response = await axios.get('http://localhost:8080/api/data/properties/');
      const data = response.data.results || response.data;
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', error);
      console.error('Error response:', error.response?.data);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images
      };

      if (editingProperty) {
        await axios.put(`http://localhost:8080/api/data/properties/${editingProperty.id}/`, propertyData);
        setSuccess('Property updated successfully');
      } else {
        await axios.post('http://localhost:8080/api/data/properties/', propertyData);
        setSuccess('Property added successfully');
      }
      
      await fetchProperties();
      setOpenDialog(false);
      setEditingProperty(null);
      resetForm();
    } catch (error) {
      setError('Failed to save property');
      console.error('Error saving property:', error);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/data/properties/${propertyId}/`);
      setSuccess('Property deleted successfully');
      await fetchProperties();
    } catch (error) {
      setError('Failed to delete property');
      console.error('Error deleting property:', error);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      property_type: property.property_type,
      location: property.location,
      price: property.price.toString(),
      area: property.area,
      description: property.description || '',
      amenities: property.amenities || '',
      images: property.images || []
    });
    setOpenDialog(true);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    resetForm();
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      property_type: 'apartment',
      location: '',
      price: '',
      area: '',
      description: '',
      amenities: '',
      images: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'primary',
      villa: 'secondary',
      plot: 'success',
      commercial: 'warning',
      office: 'info',
      shop: 'error'
    };
    return colors[type] || 'default';
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Please log in to access properties management.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Properties Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProperty}
        >
          Add Property
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(properties) && properties.length > 0 ? properties.map((property) => (
                <TableRow 
                  key={property.id}
                  onClick={() => handlePropertySelect(property)}
                  sx={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedProperty?.id === property.id ? 'action.selected' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {selectedProperty ? selectedProperty.name : property.name}
                      </Typography>
                      
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.property_type}
                      color={getPropertyTypeColor(property.property_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                      {formatPrice(property.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>{property.area}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.is_active ? 'Active' : 'Inactive'}
                      color={property.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(property.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No properties found. Add a property to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Property Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column" sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={handleInputChange}
                name="name"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={formData.property_type}
                  label="Property Type"
                  onChange={handleInputChange}
                  name="property_type"
                >
                  {propertyTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange}
                name="location"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                name="price"
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Area"
                value={formData.area}
                onChange={handleInputChange}
                name="area"
                required
                placeholder="e.g., 1200 sq ft, 2 BHK"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={8}
                placeholder="Describe layout, unique features, nearby landmarks, facing, floor, furnishing, age, society/amenities, parking, connectivity, etc."
                value={formData.description}
                onChange={handleInputChange}
                name="description"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                name="amenities"
                placeholder="e.g., Swimming Pool, Gym, Parking, Security"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProperty ? 'Update Property' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
