import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  Star,
  TrendingUp,
  Topic
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  
  const [sentimentData, setSentimentData] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [conversionData, setConversionData] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [sentimentRes, qualityRes, topicRes, conversionRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/calls/calls/sentiment_analytics/?days=${days}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/api/calls/calls/quality_metrics/?days=${days}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/api/calls/calls/topic_analytics/?days=${days}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/api/calls/calls/conversion_predictions/?days=${days}`).catch(() => ({ data: null }))
      ]);

      setSentimentData(sentimentRes.data);
      setQualityData(qualityRes.data);
      setTopicData(topicRes.data);
      setConversionData(conversionRes.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
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

  const sentimentChartData = sentimentData ? [
    { name: 'Positive', value: sentimentData.sentiment_distribution?.positive || 0, color: '#00C49F' },
    { name: 'Neutral', value: sentimentData.sentiment_distribution?.neutral || 0, color: '#FFBB28' },
    { name: 'Negative', value: sentimentData.sentiment_distribution?.negative || 0, color: '#FF8042' }
  ] : [];

  const qualityChartData = qualityData ? [
    { name: 'Excellent (80+)', value: qualityData.quality_distribution?.excellent || 0 },
    { name: 'Good (60-79)', value: qualityData.quality_distribution?.good || 0 },
    { name: 'Fair (40-59)', value: qualityData.quality_distribution?.fair || 0 },
    { name: 'Poor (<40)', value: qualityData.quality_distribution?.poor || 0 }
  ] : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Advanced Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={days}
            label="Time Period"
            onChange={(e) => setDays(e.target.value)}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Sentiment Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SentimentSatisfied sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Sentiment Analysis
              </Typography>
            </Box>
            {sentimentData && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <SentimentSatisfied sx={{ fontSize: 40, color: '#00C49F', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00C49F' }}>
                        {sentimentData.sentiment_distribution?.positive || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">Positive</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <SentimentNeutral sx={{ fontSize: 40, color: '#FFBB28', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFBB28' }}>
                        {sentimentData.sentiment_distribution?.neutral || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">Neutral</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <SentimentDissatisfied sx={{ fontSize: 40, color: '#FF8042', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF8042' }}>
                        {sentimentData.sentiment_distribution?.negative || 0}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">Negative</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Positive Sentiment: {sentimentData.positive_percentage?.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={sentimentData.positive_percentage || 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Average Confidence: {(sentimentData.average_confidence * 100).toFixed(1)}%
                  </Typography>
                </Box>
                {sentimentChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Quality Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Star sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Call Quality Metrics
              </Typography>
            </Box>
            {qualityData && (
              <>
                <Box mb={3}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    {qualityData.average_quality_score?.toFixed(1) || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Average Quality Score (out of 100)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={qualityData.average_quality_score || 0} 
                    color="primary"
                    sx={{ height: 10, borderRadius: 5, mt: 1 }}
                  />
                </Box>
                {qualityChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={qualityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Conversion Predictions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Conversion Predictions
              </Typography>
            </Box>
            {conversionData && (
              <>
                <Box mb={2}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    {(conversionData.average_probability * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Conversion Probability
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={conversionData.average_probability * 100} 
                    color="success"
                    sx={{ height: 10, borderRadius: 5, mt: 1 }}
                  />
                </Box>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#00C49F20' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#00C49F' }}>
                          {conversionData.high_probability_calls || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          High (≥70%)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#FFBB2820' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFBB28' }}>
                          {conversionData.medium_probability_calls || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Medium (40-69%)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card sx={{ bgcolor: '#FF804220' }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF8042' }}>
                          {conversionData.low_probability_calls || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Low (&lt;40%)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        {/* Topic Analytics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Topic sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Top Topics
              </Typography>
            </Box>
            {topicData && topicData.top_topics && topicData.top_topics.length > 0 ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Topics Extracted: {topicData.total_topics_extracted}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Unique Topics: {topicData.unique_topics}
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {topicData.top_topics.slice(0, 10).map((item, index) => (
                    <Box key={index} sx={{ mb: 1.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.topic}
                        </Typography>
                        <Chip 
                          label={item.count} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(item.count / topicData.total_topics_extracted) * 100} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No topics extracted yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdvancedAnalytics;
