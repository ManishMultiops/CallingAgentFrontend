import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import apiClient from '../utils/axios';

function Visits() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/calls/visits/');
      const payload = res?.data;
      if (Array.isArray(payload)) {
        setRows(payload);
      } else if (payload && Array.isArray(payload.results)) {
        setRows(payload.results);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error('Error fetching visits', e);
      setError(`Failed to load visits: ${e.response?.data?.detail || e.message}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Scheduled Visits
        </Typography>
        <IconButton onClick={fetchVisits} disabled={loading} color="primary" title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lead</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Scheduled At</TableCell>
              <TableCell>Status</TableCell>
              {/* <TableCell>Notes</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(rows) && rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.lead_name || row.lead}</TableCell>
                <TableCell>{row.property_name || '-'}</TableCell>
                <TableCell>{new Date(row.scheduled_at).toLocaleString()}</TableCell>
                <TableCell>{row.status}</TableCell>
                {/* <TableCell>{row.notes || '-'}</TableCell> */}
              </TableRow>
            ))}
            {Array.isArray(rows) && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No visits scheduled</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Visits;


