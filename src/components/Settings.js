import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  VolumeUp as VolumeUpIcon,
  Message as MessageIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import apiClient from '../utils/axios';
import TwilioSetup from './TwilioSetup';

function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    bot_voice: 'Polly.Joanna-Neural',
    greeting_message: "Hello! I'm calling from our company. How can I help you today?",
    greeting_english: "Hello! I'm calling from our company. How can I help you today?",
    greeting_hindi: "नमस्ते! मैं हमारी कंपनी की तरफ से कॉल कर रहा हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
    greeting_chinese: "你好！我是从我们公司打来的电话。今天我能为您做些什么？",
    greeting_french: "Bonjour! Je vous appelle de la part de notre entreprise. Comment puis-je vous aider aujourd'hui ?",
    voice_provider: 'openai',
    openai_api_key: '',
    deepgram_api_key: '',
    sarvam_api_key: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const voiceOptions = [
    // English - Female
    { value: 'Polly.Joanna-Neural', label: 'Joanna (Neural) - English Female' },
    { value: 'Polly.Salli-Neural', label: 'Salli (Neural) - English Female' },
    // English - Male
    { value: 'Polly.Matthew-Neural', label: 'Matthew (Neural) - English Male' },
    { value: 'Polly.Joey-Neural', label: 'Joey (Neural) - English Male' },
    // Google Wavenet - English (US)
    { value: 'Google.en-US-Wavenet-A', label: 'Google Wavenet A (Male) - Neutral, professional' },
    { value: 'Google.en-US-Wavenet-B', label: 'Google Wavenet B (Male) - Deeper, authoritative' },
    { value: 'Google.en-US-Wavenet-C', label: 'Google Wavenet C (Female) - Light, friendly' },
    { value: 'Google.en-US-Wavenet-D', label: 'Google Wavenet D (Male) - Warm, conversational  Recommended' },
    { value: 'Google.en-US-Wavenet-E', label: 'Google Wavenet E (Female) - Bright, cheerful' },
    { value: 'Google.en-US-Wavenet-F', label: 'Google Wavenet F (Female) - Professional, clear  Recommended' },
    { value: 'Google.en-US-Wavenet-G', label: 'Google Wavenet G (Female) - Softer, gentle' },
    { value: 'Google.en-US-Wavenet-H', label: 'Google Wavenet H (Female) - Warm, melodic' },
    { value: 'Google.en-US-Wavenet-I', label: 'Google Wavenet I (Male) - Deep, resonant' },
    { value: 'Google.en-US-Wavenet-J', label: 'Google Wavenet J (Male) - Energetic, engaging' },
    // Other languages
    { value: 'Polly.Zhiyu-Neural', label: 'Zhiyu (Neural) - Chinese Female' },
    { value: 'Polly.Kajal-Neural', label: 'Kajal (Neural) - Hindi Female' },
    { value: 'Polly.Lea-Neural', label: 'Lea (Neural) - French Female' },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/calls/bot-settings/');
      setSettings({
        bot_voice: response.data.bot_voice,
        greeting_message: response.data.greeting_message,
        greeting_english: response.data.greeting_english,
        greeting_hindi: response.data.greeting_hindi,
        greeting_chinese: response.data.greeting_chinese,
        greeting_french: response.data.greeting_french,
        voice_provider: response.data.voice_provider || 'openai',
        openai_api_key: response.data.openai_api_key || '',
        deepgram_api_key: response.data.deepgram_api_key || '',
        sarvam_api_key: response.data.sarvam_api_key || ''
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

    try {
      await apiClient.post('/calls/bot-settings/', {
        bot_voice: settings.bot_voice,
        greeting_message: settings.greeting_message,
        greeting_english: settings.greeting_english,
        greeting_hindi: settings.greeting_hindi,
        greeting_chinese: settings.greeting_chinese,
        greeting_french: settings.greeting_french,
        voice_provider: settings.voice_provider,
        openai_api_key: settings.openai_api_key,
        deepgram_api_key: settings.deepgram_api_key,
        sarvam_api_key: settings.sarvam_api_key
      });
      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePlayPreview = () => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(settings.greeting_message);

      // Map our voice choices to Web Speech API voices
      const voiceMap = {
        'Polly.Zhiyu-Neural': 'Zhiyu',    // Chinese female voice (name hint)
        'Polly.Lea-Neural': 'Lea'         // French female voice (name hint)
      };

      // Get available voices (voices might not be loaded immediately)
      let voices = window.speechSynthesis.getVoices();

      // Debug: Log all available voices
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));

      // If voices are not loaded yet, wait for them
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          console.log('Available voices after loading:', voices.map(v => `${v.name} (${v.lang})`));
          setVoiceAndPlay(utterance, voices, voiceMap);
        };
        return;
      }

      setVoiceAndPlay(utterance, voices, voiceMap);
    } else {
      setError('Speech synthesis not supported in this browser');
    }
  };

  const setVoiceAndPlay = (utterance, voices, voiceMap) => {
    const selectedVoiceName = voiceMap[settings.bot_voice];

    // Set language based on voice selection
    if (settings.bot_voice === 'Polly.Zhiyu-Neural') {
      utterance.lang = 'zh-CN'; // Chinese language
    } else if (settings.bot_voice === 'Polly.Lea-Neural') {
      utterance.lang = 'fr-FR'; // French language
    } else {
      utterance.lang = 'en-US'; // English language
    }

    // Find the matching voice
    const selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const isEn = voice.lang.startsWith('en');
      if (settings.bot_voice === 'Polly.Zhiyu-Neural') {
        return voice.lang.startsWith('zh') || name.includes('chinese') || name.includes('mandarin') || name.includes('zhiyu');
      }
      if (settings.bot_voice === 'Polly.Lea-Neural') {
        return voice.lang.startsWith('fr') || name.includes('french') || name.includes('lea') || name.includes('celine');
      }
      // English: try to match specific names, otherwise any English voice
      if (settings.bot_voice === 'Polly.Joanna-Neural') return isEn && (name.includes('joanna') || name.includes('female'));
      if (settings.bot_voice === 'Polly.Salli-Neural') return isEn && (name.includes('salli') || name.includes('female'));
      if (settings.bot_voice === 'Polly.Matthew-Neural') return isEn && (name.includes('matthew') || name.includes('male'));
      if (settings.bot_voice === 'Polly.Joey-Neural') return isEn && (name.includes('joey') || name.includes('male'));
      // Google Wavenet: browser preview cannot use Twilio/Google names directly, approximate by gender hints
      if (settings.bot_voice.startsWith('Google.en-US-Wavenet-')) {
        const code = settings.bot_voice.slice(-1);
        const maleCodes = ['A', 'B', 'D', 'I', 'J'];
        const femaleCodes = ['C', 'E', 'F', 'G', 'H'];
        if (maleCodes.includes(code)) return isEn && (name.includes('male') || name.includes('david') || name.includes('daniel'));
        if (femaleCodes.includes(code)) return isEn && (name.includes('female') || name.includes('samantha') || name.includes('victoria'));
      }
      return isEn;
    });

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      console.log(`Voice ${selectedVoiceName} not found, using default`);
      // Try to find any voice with matching language
      const fallbackVoice = voices.find(voice => {
        if (settings.bot_voice === 'Polly.Zhiyu-Neural') {
          return voice.lang.startsWith('zh');
        } else if (settings.bot_voice === 'Polly.Lea-Neural') {
          return voice.lang.startsWith('fr');
        } else {
          return voice.lang.startsWith('en');
        }
      });
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
        console.log(`Using fallback voice: ${fallbackVoice.name} (${fallbackVoice.lang})`);
      }
    }

    // Set voice properties
    utterance.rate = 0.8;  // Slightly slower for better clarity (especially for Chinese)
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Play the preview
    window.speechSynthesis.speak(utterance);

    // Show success message
    setSuccess('Playing voice preview...');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
          <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure your bot settings and credentials
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            label="Bot Settings"
            icon={<MessageIcon />}
            iconPosition="start"
          />
          <Tab
            label="Twilio Setup"
            icon={<PhoneIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Voice Settings */}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                  <VolumeUpIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Voice Settings
                  </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Bot Voice</InputLabel>
                  <Select
                    value={settings.bot_voice}
                    label="Bot Voice"
                    onChange={(e) => handleChange('bot_voice', e.target.value)}
                  >
                    {voiceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 'auto' }}>
                  Choose the voice that will be used for all bot conversations.
                  The neural voices provide more natural and human-like speech.
                </Typography>
              </CardContent>
            </Card>

            {/* Voice Provider Settings */}
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                  <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Voice AI Stack
                  </Typography>
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="voice-provider-label">Voice Provider</InputLabel>
                  <Select
                    labelId="voice-provider-label"
                    value={settings.voice_provider}
                    label="Voice Provider"
                    onChange={(e) => handleChange('voice_provider', e.target.value)}
                  >
                    <MenuItem value="openai">OpenAI Realtime (Best Quality)</MenuItem>
                    <MenuItem value="deepgram">Deepgram (Fast & Cost-Effective)</MenuItem>
                    <MenuItem value="sarvam">Sarvam AI (Optimized for India)</MenuItem>
                  </Select>
                </FormControl>

                {/* OpenAI key is ALWAYS required as it serves as the LLM 'Brain' for all stacks */}
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  value={settings.openai_api_key}
                  onChange={(e) => handleChange('openai_api_key', e.target.value)}
                  sx={{ mb: 2 }}
                  helperText={
                    settings.voice_provider === 'openai'
                      ? "Required for OpenAI Realtime Voice (ASR + LLM + TTS)"
                      : "Required as the 'Brain' (LLM) for the conversation"
                  }
                />

                {settings.voice_provider === 'deepgram' && (
                  <TextField
                    fullWidth
                    label="Deepgram API Key"
                    type="password"
                    value={settings.deepgram_api_key}
                    onChange={(e) => handleChange('deepgram_api_key', e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="Required for Deepgram ASR/TTS (Voice processing)"
                  />
                )}

                {settings.voice_provider === 'sarvam' && (
                  <TextField
                    fullWidth
                    label="Sarvam API Key"
                    type="password"
                    value={settings.sarvam_api_key}
                    onChange={(e) => handleChange('sarvam_api_key', e.target.value)}
                    sx={{ mb: 2 }}
                    helperText="Required for Sarvam AI Voice (Optimized for India)"
                  />
                )}

                <Typography variant="body2" color="textSecondary" sx={{ mt: 'auto' }}>
                  Select your preferred AI provider. Each provider offers different quality, latency, and cost characteristics.
                </Typography>
              </CardContent>
            </Card>

            {/* Message Settings */}
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                  <MessageIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Message Settings
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="English Greeting"
                      value={settings.greeting_english}
                      onChange={(e) => handleChange('greeting_english', e.target.value)}
                      helperText="Greeting message in English"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Hindi Greeting"
                      value={settings.greeting_hindi}
                      onChange={(e) => handleChange('greeting_hindi', e.target.value)}
                      helperText="Greeting message in Hindi"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Chinese Greeting"
                      value={settings.greeting_chinese}
                      onChange={(e) => handleChange('greeting_chinese', e.target.value)}
                      helperText="Greeting message in Chinese"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="French Greeting"
                      value={settings.greeting_french}
                      onChange={(e) => handleChange('greeting_french', e.target.value)}
                      helperText="Greeting message in French"
                    />
                  </Grid>
                </Grid>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
                  Customize the greeting messages for each language. The system will automatically use the appropriate greeting based on the lead's preferred language.
                </Typography>
              </CardContent>
            </Card>

            {/* Voice Preview & Save */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                  Voice Preview
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Selected Voice: <strong>{voiceOptions.find(v => v.value === settings.bot_voice)?.label}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Preview: "{settings.greeting_message}"
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<VolumeUpIcon />}
                  onClick={handlePlayPreview}
                >
                  Play Preview
                </Button>
              </CardContent>
              <Box display="flex" justifyContent="flex-end" sx={{ p: 2.5, borderTop: '1px solid #3f3f46', bgcolor: 'background.paper', borderRadius: '0 0 16px 16px' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ px: 4 }}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Card>
          </Box>
        </>
      )}

      {activeTab === 1 && <TwilioSetup />}
    </Box>
  );
}

export default Settings;
