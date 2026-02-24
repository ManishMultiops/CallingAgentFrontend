import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  // Chip,
  Avatar,
  LinearProgress,
  // Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  // BarChart,
  // Bar,
  // XAxis,
  // YAxis,
  // CartesianGrid,
  // Tooltip,
  // Legend,
  // ResponsiveContainer,
  // PieChart,
  // Pie,
  // Cell,
  // LineChart,
  // Line,
  // Area,
  // AreaChart
} from 'recharts';
import {
  Phone,
  // PhoneCallback,
  TrendingUp,
  TrendingDown,
  // Schedule,
  CheckCircle,
  // Cancel,
  Timer,
  People,
  Assessment
} from '@mui/icons-material';
import apiClient from '../utils/axios';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  // const [callbackStats, setCallbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    // fetchCallbackStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/calls/calls/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchCallbackStats = async () => {
  //   try {
  //     const response = await apiClient.get('/data/leads/callback_stats/');
  //     setCallbackStats(response.data);
  //   } catch (error) {
  //     console.error('Error fetching callback stats:', error);
  //   }
  // };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // const callData = [
  //   { name: 'Completed', value: analytics?.completed_calls || 0, color: '#00C49F' },
  //   { name: 'Dropped', value: analytics?.dropped_calls || 0, color: '#FF8042' },
  //   { name: 'Converted', value: analytics?.converted_calls || 0, color: '#0088FE' },
  // ];

  // const dailyData = analytics?.daily_stats || [];
  const conversionRate = analytics?.conversion_rate || 0;
  const avgDuration = analytics?.average_duration || 0;

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{
      height: '100%',
      width: '100%',
      backgroundColor: 'background.paper',
      border: `1px solid ${color}30`,
      boxShadow: 'none',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 15px ${color}20`,
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
            {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ ml: 1 }}>
              {Math.abs(trend)}% from last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // const CallbackCard = ({ title, value, color, icon }) => (
  //   <Card sx={{ height: '100%', border: `2px solid ${color}20` }}>
  //     <CardContent sx={{ textAlign: 'center', py: 3 }}>
  //       <Avatar sx={{ bgcolor: color, width: 48, height: 48, mx: 'auto', mb: 2 }}>
  //         {icon}
  //       </Avatar>
  //       <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
  //         {value}
  //       </Typography>
  //       <Typography variant="body2" color="textSecondary">
  //         {title}
  //       </Typography>
  //     </CardContent>
  //   </Card>
  // );

  return (
    <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
      {/* Row 1: Dashboard Overview - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          Dashboard Overview
        </Typography>
      </Box>

      {/* Row 2: Main Stats Cards - 4 tiles */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          width: '100%'
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatCard
              title="Total Calls"
              value={analytics?.total_calls || 0}
              icon={<Phone />}
              color="#4ade80" // Primary Green
              subtitle="All time calls made"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatCard
              title="Completed Calls"
              value={analytics?.completed_calls || 0}
              icon={<CheckCircle />}
              color="#00C49F"
              subtitle={`${Math.round(((analytics?.completed_calls || 0) / (analytics?.total_calls || 1)) * 100)}% success rate`}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatCard
              title="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              icon={<TrendingUp />}
              color="#FFBB28"
              subtitle="Calls converted to leads"
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <StatCard
              title="Avg Duration"
              value={`${Math.round(avgDuration)}s`}
              icon={<Timer />}
              color="#8884D8"
              subtitle="Average call length"
            />
          </Box>
        </Box>
      </Box>

      {/* Row 3 & 4: Callback Management & Stats - Hidden */}

      {/* Row 5 & 6: Performance Analytics & Charts - Hidden */}

      {/* Row 7: Key Performance Indicators - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 'none' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                  {Math.round(avgDuration)}s
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Average Call Duration
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((avgDuration / 120) * 100, 100)}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                  {analytics?.dropped_calls || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Dropped Calls
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((analytics?.dropped_calls || 0) / (analytics?.total_calls || 1)) * 100, 100)}
                  color="error"
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box textAlign="center" sx={{ p: 2 }}>
                <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {conversionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Conversion Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={conversionRate}
                  color="success"
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Row 8: Quick Actions - Full width */}
      <Box sx={{ px: 3 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Phone />}
                onClick={() => navigate('/data')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                View All Leads
              </Button>
            </Grid>
            {/* Manage Callbacks Action - Hidden */}
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                onClick={() => navigate('/demos')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Scheduled Demos
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<People />}
                onClick={() => navigate('/data')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Add New Lead
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Row 9: Advanced Analytics - Hidden */}
    </Box>
  );
}

export default Dashboard;