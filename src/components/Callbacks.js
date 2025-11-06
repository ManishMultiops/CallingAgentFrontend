import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  // Error as ErrorIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

function Callbacks() {
  const [callbacks, setCallbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { getAuthToken } = useAuth();

  const fetchCallbacks = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/data/leads/callbacks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to load callbacks data');
      }

      const data = await response.json();
      setCallbacks(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching callbacks:', err);
      setError('Unable to load callbacks. Please check your connection and try again.');
      setCallbacks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const fetchStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/data/leads/callback_stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data || {});
      } else {
        // If stats fail, set default empty stats
        setStats({
          total_scheduled: 0,
          due_now: 0,
          overdue: 0,
          upcoming_today: 0,
          completed_today: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Set default empty stats on error
      setStats({
        total_scheduled: 0,
        due_now: 0,
        overdue: 0,
        upcoming_today: 0,
        completed_today: 0
      });
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchCallbacks();
    fetchStats();
  }, [fetchCallbacks, fetchStats]);

  const getStatusColor = (status, isDue, isOverdue) => {
    if (isOverdue) return 'error';
    if (isDue) return 'warning';
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'primary';
    return 'default';
  };

  const getStatusText = (status, isDue, isOverdue) => {
    if (isOverdue) return 'Overdue';
    if (isDue) return 'Due Now';
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending';
    return status;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const formatTimeUntil = (timeUntil) => {
    if (!timeUntil) return 'N/A';
    // Remove negative sign and "days" from the string
    return timeUntil.replace('-', '').replace(' days,', 'd ').replace(' day,', 'd ');
  };

  const filteredCallbacks = callbacks.filter(callback => {
    const matchesFilter = filter === 'all' || 
      (filter === 'due' && callback.is_due) ||
      (filter === 'overdue' && callback.is_overdue) ||
      (filter === 'pending' && callback.status === 'pending') ||
      (filter === 'completed' && callback.status === 'completed');
    
    const matchesSearch = !searchTerm || 
      callback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      callback.phone_number.includes(searchTerm) ||
      (callback.property && callback.property.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleRefresh = () => {
    fetchCallbacks();
    fetchStats();
  };

  const handleViewDetails = (callback) => {
    setSelectedCallback(callback);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Show error only if there's an error AND no data to display
  if (error && callbacks.length === 0) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Scheduled Callbacks
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
        
        <Alert severity="warning" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Scheduled Callbacks
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Scheduled
              </Typography>
              <Typography variant="h5">
                {stats.total_scheduled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Due Now
              </Typography>
              <Typography variant="h5" color="warning.main">
                {stats.due_now || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h5" color="error.main">
                {stats.overdue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming Today
              </Typography>
              <Typography variant="h5" color="primary.main">
                {stats.upcoming_today || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Today
              </Typography>
              <Typography variant="h5" color="success.main">
                {stats.completed_today || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          placeholder="Search callbacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />
          }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="due">Due Now</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Callbacks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lead Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Scheduled Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time Until</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCallbacks.map((callback) => (
              <TableRow key={callback.id} hover>
                <TableCell>{callback.name}</TableCell>
                <TableCell>{callback.phone_number}</TableCell>
                <TableCell>
                  {callback.property ? (
                    <Box>
                      <Typography variant="body2">{callback.property}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {callback.property_location}
                      </Typography>
                    </Box>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon fontSize="small" />
                    {formatDateTime(callback.callback_scheduled_at)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(callback.status, callback.is_due, callback.is_overdue)}
                    color={getStatusColor(callback.status, callback.is_due, callback.is_overdue)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {callback.time_until_callback ? (
                    <Typography variant="body2">
                      {formatTimeUntil(callback.time_until_callback)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Due
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(callback)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredCallbacks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            {error ? 'Unable to load callbacks' : 'No callbacks found'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {error 
              ? 'Please check your connection and try refreshing the page'
              : searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No callbacks have been scheduled yet'
            }
          </Typography>
          {error && (
            <Button 
              variant="outlined" 
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          )}
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Callback Details</DialogTitle>
        <DialogContent>
          {selectedCallback && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Lead Name</Typography>
                  <Typography variant="body1">{selectedCallback.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone Number</Typography>
                  <Typography variant="body1">{selectedCallback.phone_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Property</Typography>
                  <Typography variant="body1">
                    {selectedCallback.property || 'N/A'}
                  </Typography>
                  {selectedCallback.property_location && (
                    <Typography variant="caption" color="textSecondary">
                      {selectedCallback.property_location}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={getStatusText(selectedCallback.status, selectedCallback.is_due, selectedCallback.is_overdue)}
                    color={getStatusColor(selectedCallback.status, selectedCallback.is_due, selectedCallback.is_overdue)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Scheduled Time</Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedCallback.callback_scheduled_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Time Until Callback</Typography>
                  <Typography variant="body1">
                    {selectedCallback.time_until_callback 
                      ? formatTimeUntil(selectedCallback.time_until_callback)
                      : 'Due now'
                    }
                  </Typography>
                </Grid>
                {selectedCallback.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                    <Typography variant="body1">{selectedCallback.notes}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Created</Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedCallback.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedCallback.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Callbacks;

