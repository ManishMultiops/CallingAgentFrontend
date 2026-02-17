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
  Inventory as ProductIcon,
  PlayArrow as PlayIcon
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
  const [products, setProducts] = useState([]);
  const [csvUploads, setCsvUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadCalls, setLeadCalls] = useState([]);
  const [leadCallsLoading, setLeadCallsLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  // const [selectedFile, setSelectedFile] = useState(null);
  const [newLead, setNewLead] = useState({
    name: '',
    phone_number: '',
    product: '',
    status: 'pending',
    preferred_language: 'en'
  });
  const [editLead, setEditLead] = useState({
    id: null,
    name: '',
    phone_number: '',
    product: '',
    status: 'pending',
    preferred_language: 'en',
    scheduled_call_at: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/data/products/');
      const data = response.data.results || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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
        product_id: newLead.product || null  // Use product_id for API
      };
      delete leadData.product;  // Remove the product field since we're using product_id
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
      setNewLead({ name: '', phone_number: '', product: '', status: 'pending', preferred_language: 'en', scheduled_call_at: '' });
      setOpenDialog(false);
      fetchLeads();
    } catch (error) {
      setError('Failed to add lead');
      console.error('Error adding lead:', error);
    }
  };

  const handleAssignProduct = (lead) => {
    setSelectedLead(lead);
    setOpenProductDialog(true);
  };

  const handleProductAssignment = async (productId) => {
    try {
      const updateData = {
        ...selectedLead,
        product_id: productId  // Use product_id for API
      };
      delete updateData.product;  // Remove the product field since we're using product_id

      await apiClient.put(`/data/leads/${selectedLead.id}/`, updateData);
      setSuccess('Product assigned successfully');
      setOpenProductDialog(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      setError('Failed to assign product');
      console.error('Error assigning product:', error);
    }
  };

  const handleMenuOpen = (event, lead) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setOpenViewDialog(true);
    fetchLeadCalls(lead.id);
    handleMenuClose();
  };

  const fetchLeadCalls = async (leadId) => {
    try {
      setLeadCallsLoading(true);
      const response = await apiClient.get('/calls/calls/', {
        params: { lead_id: leadId }
      });
      const data = response.data.results || response.data;
      setLeadCalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching lead calls:', err);
      setLeadCalls([]);
    } finally {
      setLeadCallsLoading(false);
    }
  };

  const handleEditLeadOpen = () => {
    if (selectedLead) {
      setEditLead({
        id: selectedLead.id,
        name: selectedLead.name,
        phone_number: selectedLead.phone_number,
        product: selectedLead.product ? selectedLead.product.id : '',
        status: selectedLead.status,
        preferred_language: selectedLead.preferred_language || 'en',
        scheduled_call_at: selectedLead.scheduled_call_at || ''
      });
      setOpenEditDialog(true);
    }
    handleMenuClose();
  };

  const parseTranscription = (transcription) => {
    if (!transcription) return [];
    const lines = transcription.split('\n');
    return lines.map(line => {
      const match = line.match(/^(AI|User \(OpenAI\)|User): (.*)$/);
      if (match) {
        return {
          role: match[1] === 'AI' ? 'bot' : 'user',
          text: match[2]
        };
      }
      return { role: 'user', text: line }; // Fallback
    }).filter(t => t.text.trim() !== '');
  };

  const handleEditLeadSave = async () => {
    try {
      const updateData = {
        name: editLead.name,
        phone_number: editLead.phone_number,
        status: editLead.status,
        preferred_language: editLead.preferred_language,
        product_id: editLead.product || null
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
      // Find the lead to get product details
      const lead = leads.find(l => l.id === leadId);
      if (!lead) {
        setError('Lead not found');
        return;
      }

      const payload = {
        lead_id: leadId
      };

      // Include product details if available
      if (lead.product) {
        payload.product_context = {
          title: lead.product.title,
          description: lead.product.description
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
            <Tab label="Rejected" value="rejected" />
            <Tab label="Converted" value="converted" />
          </Tabs>
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
                  <TableCell>Product</TableCell>
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
                      {lead.product ? (
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {lead.product.title}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip
                          label="No Product Assigned"
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
                      {!lead.product && (
                        <IconButton
                          color="warning"
                          onClick={() => handleAssignProduct(lead)}
                          title="Assign Product"
                        >
                          <ProductIcon />
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
        <MenuItem onClick={() => handleViewLead(selectedLead)}>View</MenuItem>
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
              <InputLabel>Product</InputLabel>
              <Select
                value={newLead.product}
                label="Product"
                onChange={(e) => setNewLead({ ...newLead, product: e.target.value })}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.title}
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
              <InputLabel>Product</InputLabel>
              <Select
                value={editLead.product}
                label="Product"
                onChange={(e) => setEditLead({ ...editLead, product: e.target.value })}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.title}
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

      {/* View Lead Dialog - Premium UI */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">Lead Details</Typography>
            {selectedLead && (
              <Chip
                label={selectedLead.status.toUpperCase()}
                color={getStatusColor(selectedLead.status)}
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedLead && (
            <Box>
              {/* Top Summary Cards - Using Flexbox for perfect distribution */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4, width: '100%' }}>
                {[
                  {
                    label: 'Lead Score',
                    value: selectedLead.lead_score || 0,
                    sub: selectedLead.lead_score >= 70 ? 'Hot' : selectedLead.lead_score >= 40 ? 'Warm' : 'Cold',
                    color: selectedLead.lead_score >= 70 ? 'success' : selectedLead.lead_score >= 40 ? 'warning' : 'default',
                    bg: '#e0f2fe' // Light blue
                  },
                  {
                    label: 'Engagement',
                    value: `${(selectedLead.lead_warmth_score * 100).toFixed(0)}%`,
                    sub: 'Warmth Score',
                    bg: '#f0fdf4' // Light green
                  },
                  {
                    label: 'Language',
                    value: selectedLead.preferred_language === 'en' ? 'English' :
                      selectedLead.preferred_language === 'hi' ? 'हिन्दी' :
                        selectedLead.preferred_language === 'zh' ? '中文' :
                          selectedLead.preferred_language === 'fr' ? 'Français' : 'English',
                    bg: '#faf5ff' // Light purple
                  }
                ].map((item, idx) => (
                  <Card
                    key={idx}
                    variant="outlined"
                    sx={{
                      bgcolor: item.bg,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      minWidth: 0 // Prevents flex items from overflowing
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold', lineHeight: 1, mb: 1, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h4" fontWeight="bold">
                          {item.value}
                        </Typography>
                        {item.sub && (
                          item.color ? (
                            <Chip label={item.sub} size="small" color={item.color} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>{item.sub}</Typography>
                          )
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Personal Info Section */}
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Contact Information</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">FULL NAME</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedLead.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">PHONE NUMBER</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedLead.phone_number}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="textSecondary">PRODUCT INTERESTED</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {selectedLead.product ? selectedLead.product.title : 'Not Assigned'}
                    </Typography>
                  </Grid>
                  {selectedLead.preferred_budget_range && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="textSecondary">BUDGET RANGE</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedLead.preferred_budget_range}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Chat History Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 4 }}>
                <Typography variant="h6" fontWeight="bold">Call Conversation History</Typography>
                {!leadCallsLoading && leadCalls.find(c => c.recording_file || c.recording_url) && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    href={leadCalls.find(c => c.recording_file || c.recording_url).recording_file || leadCalls.find(c => c.recording_file || c.recording_url).recording_url}
                    target="_blank"
                    startIcon={<PlayIcon />}
                    sx={{ borderRadius: 20, px: 2, textTransform: 'none', fontWeight: 'bold', boxShadow: 2 }}
                  >
                    Complete Call Recording
                  </Button>
                )}
              </Box>
              {leadCallsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : leadCalls.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, maxHeight: '500px', overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {leadCalls.map((call, callIdx) => (
                      <Box key={call.id}>
                        {/* Call Session Marker */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, my: 2 }}>
                          <Chip
                            label={`CALL ON ${new Date(call.started_at).toLocaleString()} - ${call.status.toUpperCase()}`}
                            size="small"
                            variant="outlined"
                            sx={{ bgcolor: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}
                          />
                        </Box>

                        {call.transcription ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {parseTranscription(call.transcription).map((msg, msgIdx) => (
                              <Box
                                key={`${call.id}-${msgIdx}`}
                                sx={{
                                  alignSelf: msg.role === 'bot' ? 'flex-start' : 'flex-end',
                                  maxWidth: '85%',
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: msg.role === 'bot' ? 'white' : 'primary.main',
                                  color: msg.role === 'bot' ? 'text.primary' : 'white',
                                  boxShadow: 1,
                                  position: 'relative',
                                  border: msg.role === 'bot' ? '1px solid' : 'none',
                                  borderColor: 'divider'
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, opacity: 0.8 }}>
                                  {msg.role === 'bot' ? '🤖 AI AGENT' : '👤 USER'}
                                </Typography>
                                <Typography variant="body2">{msg.text}</Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                              No transcription records for this session.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography variant="body2" color="textSecondary">No calls have been recorded for this lead yet.</Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenViewDialog(false)} variant="contained" color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Product Assignment Dialog */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Product to {selectedLead?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a product to assign to this lead:
          </Typography>
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} key={product.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => handleProductAssignment(product.id)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {product.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DataManagement;
