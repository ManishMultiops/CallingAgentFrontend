// API Configuration
// Automatically detects environment and sets API base URL

const getApiBaseUrl = () => {
  // Check if running locally (browser-side check)
  // This ensures that even if build variables are set for prod, local dev uses local backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8080';
    }
  }

  // Check for Railway environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Check for Railway backend service URL
  if (process.env.REACT_APP_RAILWAY_BACKEND_URL) {
    return process.env.REACT_APP_RAILWAY_BACKEND_URL;
  }

  // Default to local development
  return 'http://127.0.0.1:8080';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

