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
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
  , Menu
} from '@mui/material';
import {
  Add,
  Upload,
  Download,
  Phone,
  MoreVert,
  Home
} from '@mui/icons-material';
import apiClient from '../utils/axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 3 }}>{children}</Box>
    </div>
  );
}

function DataManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [leads, setLeads] = useState([]);
  const [statusTab, setStatusTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [csvUploads, setCsvUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  // const [selectedFile, setSelectedFile] = useState(null);
  const [newLead, setNewLead] = useState({
    name: '',
    phone_number: '',
    property: '',
    status: 'pending',
    preferred_language: 'en'
  });
  const [editLead, setEditLead] = useState({
    id: null,
    name: '',
    phone_number: '',
    property: '',
    status: 'pending',
    preferred_language: 'en',
    scheduled_call_at: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchProperties();
    fetchCsvUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusTab !== 'high_value') {
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab]);

  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const response = await apiClient.get('/data/leads/', {
        params: { status: statusTab }
      });
      const data = response.data.results || response.data;
      // Ensure data is always an array
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch leads');
      console.error('Error fetching leads:', error);
      // Set empty array on error to prevent map error
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/data/properties/');
      const data = response.data.results || response.data;
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const fetchCsvUploads = async () => {
    try {
      setCsvLoading(true);
      const response = await apiClient.get('/data/csv-uploads/');
      const data = response.data.results || response.data;
      // Ensure data is always an array
      setCsvUploads(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch CSV uploads');
      console.error('Error fetching CSV uploads:', error);
      // Set empty array on error to prevent map error
      setCsvUploads([]);
    } finally {
      setCsvLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusTabChange = (event, newValue) => {
    setStatusTab(newValue);
    setSelectedIds([]);
    if (newValue === 'high_value') {
      // Fetch high-value leads
      apiClient.get('/data-management/leads/high_value_leads/?min_score=50&limit=50')
        .then(res => setLeads(res.data.leads || []))
        .catch(err => {
          setError('Failed to fetch high-value leads');
          console.error(err);
        });
    }
  };

  const handleAddLead = async () => {
    try {
      const leadData = {
        ...newLead,
        property_id: newLead.property || null  // Use property_id for API
      };
      delete leadData.property;  // Remove the property field since we're using property_id
      // Convert datetime-local to ISO if present
      if (leadData.scheduled_call_at) {
        try {
          const dt = new Date(leadData.scheduled_call_at);
          leadData.scheduled_call_at = dt.toISOString();
        } catch (e) {
          // ignore
        }
      }

      await apiClient.post('/data/leads/', leadData);
      setSuccess('Lead added successfully');
      setNewLead({ name: '', phone_number: '', property: '', status: 'pending', preferred_language: 'en', scheduled_call_at: '' });
      setOpenDialog(false);
      fetchLeads();
    } catch (error) {
      setError('Failed to add lead');
      console.error('Error adding lead:', error);
    }
  };

  const handleAssignProperty = (lead) => {
    setSelectedLead(lead);
    setOpenPropertyDialog(true);
  };

  const handlePropertyAssignment = async (propertyId) => {
    try {
      const updateData = {
        ...selectedLead,
        property_id: propertyId  // Use property_id for API
      };
      delete updateData.property;  // Remove the property field since we're using property_id

      await apiClient.put(`/data/leads/${selectedLead.id}/`, updateData);
      setSuccess('Property assigned successfully');
      setOpenPropertyDialog(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      setError('Failed to assign property');
      console.error('Error assigning property:', error);
    }
  };

  const handleMenuOpen = (event, lead) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewLead = () => {
    setOpenViewDialog(true);
    handleMenuClose();
  };

  const handleEditLeadOpen = () => {
    if (selectedLead) {
      setEditLead({
        id: selectedLead.id,
        name: selectedLead.name,
        phone_number: selectedLead.phone_number,
        property: selectedLead.property ? selectedLead.property.id : '',
        status: selectedLead.status,
        preferred_language: selectedLead.preferred_language || 'en',
        scheduled_call_at: selectedLead.scheduled_call_at || ''
      });
      setOpenEditDialog(true);
    }
    handleMenuClose();
  };

  const handleEditLeadSave = async () => {
    try {
      const updateData = {
        name: editLead.name,
        phone_number: editLead.phone_number,
        status: editLead.status,
        preferred_language: editLead.preferred_language,
        property_id: editLead.property || null
      };
      // Convert datetime-local to ISO if present
      if (editLead.scheduled_call_at) {
        try {
          const dt = new Date(editLead.scheduled_call_at);
          updateData.scheduled_call_at = dt.toISOString();
        } catch (e) {
          // ignore
        }
      } else {
        updateData.scheduled_call_at = null;
      }
      await apiClient.put(`/data/leads/${editLead.id}/`, updateData);
      setSuccess('Lead updated successfully');
      setOpenEditDialog(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      setError('Failed to update lead');
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async () => {
    try {
      await apiClient.delete(`/data/leads/${selectedLead.id}/`);
      setSuccess('Lead deleted successfully');
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      setError('Failed to delete lead');
      console.error('Error deleting lead:', error);
    } finally {
      handleMenuClose();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await apiClient.post('/data/csv-uploads/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Process the CSV
      await apiClient.post(`/data/csv-uploads/${response.data.id}/process/`);

      setSuccess('CSV uploaded and processed successfully');
      fetchCsvUploads();
      fetchLeads();
    } catch (error) {
      setError('Failed to upload CSV');
      console.error('Error uploading CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await apiClient.get('/data/csv-uploads/sample/', { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads_sample.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to download sample CSV');
      console.error('Error downloading sample CSV:', e);
    }
  };

  const initiateCall = async (leadId) => {
    try {
      // Find the lead to get property details
      const lead = leads.find(l => l.id === leadId);
      if (!lead) {
        setError('Lead not found');
        return;
      }

      const payload = {
        lead_id: leadId
      };

      // Include property details if available
      if (lead.property) {
        payload.property_context = {
          name: lead.property.name,
          location: lead.property.location,
          price: lead.property.price,
          area: lead.property.area,
          property_type: lead.property.property_type,
          description: lead.property.description,
          amenities: lead.property.amenities
        };
      }

      await apiClient.post('/calls/calls/initiate_call/', payload);
      setSuccess('Call initiated successfully');
    } catch (error) {
      setError('Failed to initiate call');
      console.error('Error initiating call:', error);
    }
  };

  const toggleSelectLead = (leadId) => {
    setSelectedIds(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
  };

  const selectAllVisible = (checked) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const bulkChangeStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await apiClient.post('/data/leads/bulk_update_status/', {
        ids: selectedIds,
        status: newStatus
      });
      setSuccess(`Updated ${selectedIds.length} leads`);
      setSelectedIds([]);
      fetchLeads();
    } catch (e) {
      setError('Failed to update leads');
      console.error(e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      case 'converted': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* <Typography variant="h4" gutterBottom>
        Leads
      </Typography> */}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Leads" />
          <Tab label="CSV Uploads" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={statusTab} onChange={handleStatusTabChange}>
            <Tab label="Pending" value="pending" />
            <Tab label="In Progress" value="in_progress" />
            <Tab label="Completed" value="completed" />
            <Tab label="Rejected" value="rejected" />
            <Tab label="Converted" value="converted" />
            <Tab label="High Value" value="high_value" />
          </Tabs>
          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              try {
                const res = await apiClient.get('/data-management/leads/high_value_leads/?min_score=70&limit=20');
                setLeads(res.data.leads);
                setStatusTab('high_value');
              } catch (err) {
                setError('Failed to fetch high-value leads');
                console.error(err);
              }
            }}
            sx={{ ml: 2 }}
          >
            View High-Value Leads
          </Button>
          <FormControl size="small" sx={{ minWidth: 220 }} disabled={selectedIds.length === 0}>
            <InputLabel>Bulk Action</InputLabel>
            <Select
              label="Bulk Action"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val) bulkChangeStatus(val);
              }}
              renderValue={() => 'Bulk Action'}
            >
              <MenuItem value="pending">Set Pending</MenuItem>
              <MenuItem value="in_progress">Approve & Start</MenuItem>
              <MenuItem value="completed">Set Completed</MenuItem>
              <MenuItem value="rejected" sx={{ color: 'error.main' }}>Set Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Leads Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Lead
          </Button>
        </Box>

        {leadsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === leads.length}
                      onChange={(e) => selectAllVisible(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Lead Score</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(leads) && leads.length > 0 ? leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.phone_number}</TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={`Score: ${lead.lead_score || 0}`}
                          color={lead.lead_score >= 70 ? 'success' : lead.lead_score >= 50 ? 'warning' : 'default'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        {lead.lead_warmth_score > 0 && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Warmth: {(lead.lead_warmth_score * 100).toFixed(0)}%
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {lead.property ? (
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {lead.property.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {lead.property.location}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip
                          label="No Property Assigned"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.preferred_language === 'en' ? 'English' :
                          lead.preferred_language === 'hi' ? 'Hindi' :
                            lead.preferred_language === 'zh' ? 'Chinese' :
                              lead.preferred_language === 'fr' ? 'French' : 'English'}
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => initiateCall(lead.id)}
                        disabled={lead.status === 'completed' || lead.status === 'converted'}
                        title="Call"
                      >
                        <Phone />
                      </IconButton>
                      {!lead.property && (
                        <IconButton
                          color="warning"
                          onClick={() => handleAssignProperty(lead)}
                          title="Assign Property"
                        >
                          <Home />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, lead)}
                        title="More"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No leads found. Add a lead to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">CSV Uploads</Typography>
          <Box>
            <Button
              variant="text"
              startIcon={<Download />}
              onClick={handleDownloadSample}
              sx={{ mr: 1 }}
            >
              Sample CSV
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<Upload />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Upload CSV'}
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>

        {csvLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {Array.isArray(csvUploads) && csvUploads.length > 0 ? csvUploads.map((upload) => (
              <Grid item xs={12} md={6} key={upload.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {upload.file.split('/').pop()}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Uploaded: {new Date(upload.uploaded_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Total Records: {upload.total_records}
                    </Typography>
                    <Typography variant="body2">
                      Processed: {upload.processed_records}
                    </Typography>
                    <Chip
                      label={upload.processed ? 'Processed' : 'Pending'}
                      color={upload.processed ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" align="center">
                      No CSV uploads found. Upload a CSV file to get started.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>

      {/* Row actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewLead}>View</MenuItem>
        <MenuItem onClick={handleEditLeadOpen}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {/* Add Lead Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              fullWidth
              label="Name"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newLead.phone_number}
              onChange={(e) => setNewLead({ ...newLead, phone_number: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Schedule Call At (optional)"
              InputLabelProps={{ shrink: true }}
              value={newLead.scheduled_call_at || ''}
              onChange={(e) => setNewLead({ ...newLead, scheduled_call_at: e.target.value })}
              helperText="If set and approved, the call will be scheduled at this time"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Property</InputLabel>
              <Select
                value={newLead.property}
                label="Property"
                onChange={(e) => setNewLead({ ...newLead, property: e.target.value })}
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newLead.status}
                label="Status"
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Preferred Language</InputLabel>
              <Select
                value={newLead.preferred_language}
                label="Preferred Language"
                onChange={(e) => setNewLead({ ...newLead, preferred_language: e.target.value })}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLead} variant="contained">Add Lead</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextField
              fullWidth
              label="Name"
              value={editLead.name}
              onChange={(e) => setEditLead({ ...editLead, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={editLead.phone_number}
              onChange={(e) => setEditLead({ ...editLead, phone_number: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Schedule Call At (optional)"
              InputLabelProps={{ shrink: true }}
              value={editLead.scheduled_call_at || ''}
              onChange={(e) => setEditLead({ ...editLead, scheduled_call_at: e.target.value })}
              helperText="If set and approved, the call will be scheduled at this time"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Property</InputLabel>
              <Select
                value={editLead.property}
                label="Property"
                onChange={(e) => setEditLead({ ...editLead, property: e.target.value })}
              >
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name} - {property.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editLead.status}
                label="Status"
                onChange={(e) => setEditLead({ ...editLead, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel>Preferred Language</InputLabel>
              <Select
                value={editLead.preferred_language}
                label="Preferred Language"
                onChange={(e) => setEditLead({ ...editLead, preferred_language: e.target.value })}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditLeadSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* View Lead Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lead Details</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography variant="body1">{selectedLead.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Phone Number</Typography>
                <Typography variant="body1">{selectedLead.phone_number}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Property</Typography>
                <Typography variant="body1">{selectedLead.property ? `${selectedLead.property.name} - ${selectedLead.property.location}` : 'Not assigned'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography variant="body1">{selectedLead.status}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Preferred Language</Typography>
                <Typography variant="body1">{selectedLead.preferred_language}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Lead Score</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={selectedLead.lead_score || 0}
                    color={selectedLead.lead_score >= 70 ? 'success' : selectedLead.lead_score >= 50 ? 'warning' : 'default'}
                    size="small"
                  />
                  {selectedLead.lead_warmth_score > 0 && (
                    <Typography variant="caption" color="textSecondary">
                      Warmth: {(selectedLead.lead_warmth_score * 100).toFixed(0)}%
                    </Typography>
                  )}
                </Box>
              </Grid>
              {selectedLead.preferred_budget_range && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Budget Range</Typography>
                  <Typography variant="body1">{selectedLead.preferred_budget_range}</Typography>
                </Grid>
              )}
              {selectedLead.preferred_locations && selectedLead.preferred_locations.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Preferred Locations</Typography>
                  <Typography variant="body1">{selectedLead.preferred_locations.join(', ')}</Typography>
                </Grid>
              )}
              {selectedLead.optimal_call_time && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Optimal Call Time</Typography>
                  <Typography variant="body1">{selectedLead.optimal_call_time}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2">Created At</Typography>
                <Typography variant="body1">{new Date(selectedLead.created_at).toLocaleString()}</Typography>
              </Grid>
              {selectedLead.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body1">{selectedLead.notes}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={async () => {
                    try {
                      const res = await apiClient.get(`/data-management/leads/${selectedLead.id}/recommendations/`);
                      alert(`Recommendations:\n${res.data.recommendations.map((r, i) => `${i + 1}. ${r.name} - Score: ${r.recommendation_score}`).join('\n')}`);
                    } catch (err) {
                      console.error('Error fetching recommendations:', err);
                    }
                  }}
                >
                  View Property Recommendations
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Property Assignment Dialog */}
      <Dialog open={openPropertyDialog} onClose={() => setOpenPropertyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Property to {selectedLead?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a property to assign to this lead:
          </Typography>
          <Grid container spacing={2}>
            {properties.map((property) => (
              <Grid item xs={12} key={property.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => handlePropertyAssignment(property.id)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {property.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {property.location}
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      ₹{property.price.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {property.area} • {property.property_type}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPropertyDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DataManagement;
