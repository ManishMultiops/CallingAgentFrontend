import React, { useState, useEffect } from 'react';
import {
  Box,
//   Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Save as SaveIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import axios from 'axios';

function TwilioSetup() {
  const [settings, setSettings] = useState({
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    openai_api_key: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/calls/bot-settings/');
      setSettings({
        twilio_account_sid: response.data.twilio_account_sid || '',
        twilio_auth_token: response.data.twilio_auth_token || '',
        twilio_phone_number: response.data.twilio_phone_number || '',
        openai_api_key: response.data.openai_api_key || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    // Validate required fields
    if (!settings.twilio_account_sid.trim()) {
      setError('Twilio Account SID is required');
      setSaving(false);
      return;
    }
    if (!settings.twilio_auth_token.trim()) {
      setError('Twilio Auth Token is required');
      setSaving(false);
      return;
    }
    if (!settings.twilio_phone_number.trim()) {
      setError('Twilio Phone Number is required');
      setSaving(false);
      return;
    }
    if (!settings.openai_api_key.trim()) {
      setError('OpenAI API Key is required');
      setSaving(false);
      return;
    }
    
    try {
      await axios.post('http://localhost:8080/api/calls/bot-settings/', settings);
      setSuccess('Twilio credentials saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          <PhoneIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Twilio Setup
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure your Twilio and OpenAI credentials for making calls
        </Typography>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Twilio Credentials */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <PhoneIcon sx={{ mr: 2, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Twilio Credentials
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Twilio Account SID *"
                value={settings.twilio_account_sid}
                onChange={(e) => handleChange('twilio_account_sid', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                helperText="Your Twilio Account SID from the Twilio Console"
              />

              <TextField
                fullWidth
                type="password"
                label="Twilio Auth Token *"
                value={settings.twilio_auth_token}
                onChange={(e) => handleChange('twilio_auth_token', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Your Twilio Auth Token"
                helperText="Your Twilio Auth Token from the Twilio Console"
              />

              <TextField
                fullWidth
                label="Twilio Phone Number *"
                value={settings.twilio_phone_number}
                onChange={(e) => handleChange('twilio_phone_number', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="+1XXXXXXXXXX"
                helperText="Your Twilio phone number in E.164 format"
              />

              <Typography variant="body2" color="textSecondary">
                All Twilio credentials are required for making calls. You can find these in your Twilio Console dashboard.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* OpenAI Credentials */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <SecurityIcon sx={{ mr: 2, color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  OpenAI Credentials
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                type="password"
                label="OpenAI API Key *"
                value={settings.openai_api_key}
                onChange={(e) => handleChange('openai_api_key', e.target.value)}
                sx={{ mb: 2 }}
                placeholder="sk-..."
                helperText="Your OpenAI API key for AI responses"
              />

              <Typography variant="body2" color="textSecondary">
                OpenAI API key is required for generating intelligent responses during calls. 
                You can get your API key from the OpenAI platform.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 4, py: 1.5 }}
            >
              {saving ? 'Saving...' : 'Save Credentials'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TwilioSetup;
