// API Configuration
// Automatically detects environment and sets API base URL

const getApiBaseUrl = () => {
  // Check for Railway environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check for Railway backend service URL
  if (process.env.REACT_APP_RAILWAY_BACKEND_URL) {
    return process.env.REACT_APP_RAILWAY_BACKEND_URL;
  }
  
  // Default to local development
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

