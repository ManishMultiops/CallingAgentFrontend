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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  // LineChart,
  // Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Phone,
  PhoneCallback,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Cancel,
  Timer,
  People,
  Assessment
} from '@mui/icons-material';
import axios from 'axios';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [callbackStats, setCallbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchCallbackStats();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/calls/calls/analytics/');
      setAnalytics(response.data);
    } catch (error) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallbackStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/data/leads/callback_stats/');
      setCallbackStats(response.data);
    } catch (error) {
      console.error('Error fetching callback stats:', error);
    }
  };

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

  const callData = [
    { name: 'Completed', value: analytics?.completed_calls || 0, color: '#00C49F' },
    { name: 'Dropped', value: analytics?.dropped_calls || 0, color: '#FF8042' },
    { name: 'Converted', value: analytics?.converted_calls || 0, color: '#0088FE' },
  ];

  const dailyData = analytics?.daily_stats || [];
  const conversionRate = analytics?.conversion_rate || 0;
  const avgDuration = analytics?.average_duration || 0;

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15, ${color}05)` }}>
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

  const CallbackCard = ({ title, value, color, icon }) => (
    <Card sx={{ height: '100%', border: `2px solid ${color}20` }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48, mx: 'auto', mb: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
      {/* Row 1: Dashboard Overview - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
          Dashboard Overview
        </Typography>
      </Box>

      {/* Row 2: Main Stats Cards - 4 tiles */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Grid container spacing={0} sx={{ width: '100%' }}>
          <Grid item xs={12} sm={6} md={3.5} sx={{ pr: 1, pb: 3 }}>
            <StatCard
              title="Total Calls"
              value={analytics?.total_calls || 0}
              icon={<Phone />}
              color="#1976d2"
              subtitle="All time calls made"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.5} sx={{ px: 1, pb: 3 }}>
            <StatCard
              title="Completed Calls"
              value={analytics?.completed_calls || 0}
              icon={<CheckCircle />}
              color="#00C49F"
              subtitle={`${Math.round(((analytics?.completed_calls || 0) / (analytics?.total_calls || 1)) * 100)}% success rate`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.5} sx={{ px: 1, pb: 3 }}>
            <StatCard
              title="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              icon={<TrendingUp />}
              color="#FFBB28"
              subtitle="Calls converted to leads"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3.5} sx={{ pl: 1, pb: 3 }}>
            <StatCard
              title="Avg Duration"
              value={`${Math.round(avgDuration)}s`}
              icon={<Timer />}
              color="#8884D8"
              subtitle="Average call length"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Row 3: Callback Management - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          Callback Management
        </Typography>
      </Box>

      {/* Row 4: Callback Stats - 5 tiles */}
      {callbackStats && (
        <Box sx={{ px: 3, mb: 4 }}>
          <Grid container spacing={0} sx={{ width: '100%' }}>
            <Grid item xs={12} sm={6} md={2.4} sx={{ pr: 1, pb: 3 }}>
              <CallbackCard
                title="Scheduled Callbacks"
                value={callbackStats.total_scheduled || 0}
                color="#1976d2"
                icon={<Schedule />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4} sx={{ px: 1, pb: 3 }}>
              <CallbackCard
                title="Due Now"
                value={callbackStats.due_now || 0}
                color="#FF9800"
                icon={<PhoneCallback />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4} sx={{ px: 1, pb: 3 }}>
              <CallbackCard
                title="Overdue"
                value={callbackStats.overdue || 0}
                color="#f44336"
                icon={<Cancel />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4} sx={{ px: 1, pb: 3 }}>
              <CallbackCard
                title="Upcoming Today"
                value={callbackStats.upcoming_today || 0}
                color="#2196f3"
                icon={<Assessment />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4} sx={{ pl: 1, pb: 3 }}>
              <CallbackCard
                title="Completed Today"
                value={callbackStats.completed_today || 0}
                color="#4caf50"
                icon={<CheckCircle />}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Row 5: Performance Analytics - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          Performance Analytics
        </Typography>
      </Box>

      {/* Row 6: Charts - 2 half tiles */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Grid container spacing={0} sx={{ width: '100%' }}>
          {/* Call Status Distribution - Half tile */}
          <Grid item xs={12} md={6} sx={{ pr: 1.5 }}>
            <Paper sx={{ p: 3, height: '400px', borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
                Call Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={callData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {callData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Daily Call Activity - Half tile */}
          <Grid item xs={12} md={6} sx={{ pl: 1.5 }}>
            <Paper sx={{ p: 3, height: '400px', borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
                Daily Call Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} name="Total Calls" />
                  <Area type="monotone" dataKey="completed" stackId="2" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Row 7: Key Performance Indicators - Full width */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#1976d2' }}>
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Phone />}
                onClick={() => navigate('/leads')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                View All Leads
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<PhoneCallback />}
                onClick={() => navigate('/callbacks')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Manage Callbacks
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                onClick={() => navigate('/calls')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Call History
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<People />}
                onClick={() => navigate('/leads')}
                sx={{ py: 2, borderRadius: 2 }}
              >
                Add New Lead
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Row 9: Advanced Analytics Quick Access */}
      <Box sx={{ px: 3, mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            📊 Advanced Analytics Available
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: 'white', opacity: 0.9 }}>
            Explore sentiment analysis, call quality metrics, topic extraction, and conversion predictions
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/analytics')}
            sx={{ 
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': { bgcolor: '#f5f5f5' },
              px: 4,
              py: 1.5
            }}
          >
            View Advanced Analytics
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;