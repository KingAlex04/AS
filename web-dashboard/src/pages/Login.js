import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { LockOutlined, Refresh, CheckCircle } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { APP_NAME, API_URL, API_URLS, DEFAULT_ADMIN, testApiEndpoint } from '../utils/config';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverStatus, setServerStatus] = useState({ 
    checking: false, 
    online: null, 
    message: '', 
    activeApi: API_URL 
  });
  const [apiCheckResults, setApiCheckResults] = useState([]);

  const { login, isAuthenticated, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check all server endpoints on load
  useEffect(() => {
    checkAllServers();
  }, []);

  // Check all available API endpoints
  const checkAllServers = async () => {
    setServerStatus({ 
      checking: true, 
      online: null, 
      message: 'Checking all server endpoints...', 
      activeApi: API_URL 
    });
    
    setApiCheckResults(API_URLS.map(url => ({ url, status: 'checking' })));
    
    const results = [];
    let anyOnline = false;
    let bestApi = null;
    
    // Test all endpoints in parallel for faster checking
    const testPromises = API_URLS.map(url => testApiEndpoint(url));
    const apiResults = await Promise.all(testPromises);
    
    for (const result of apiResults) {
      if (result.online) {
        results.push({ url: result.url, online: true, message: 'Online' });
        anyOnline = true;
        if (!bestApi) bestApi = result.url; // Use the first working API
        
        setApiCheckResults(prev => 
          prev.map(res => res.url === result.url ? 
            { ...res, status: 'online' } : res)
        );
      } else {
        results.push({ 
          url: result.url, 
          online: false, 
          message: result.error || `Error: ${result.status || 'Unknown'}`
        });
        
        setApiCheckResults(prev => 
          prev.map(res => res.url === result.url ? 
            { ...res, status: 'error' } : res)
        );
      }
    }
    
    if (anyOnline) {
      // Configure axios to use the best API
      if (bestApi) {
        console.log(`Using API endpoint: ${bestApi}`);
        axios.defaults.baseURL = bestApi;
      }
      
      setServerStatus({
        checking: false,
        online: true,
        message: 'Connected to server',
        activeApi: bestApi || API_URL
      });
    } else {
      setServerStatus({
        checking: false,
        online: false,
        message: 'All server endpoints are offline',
        activeApi: API_URL
      });
    }
    
    return results;
  };

  // Retry connection to server
  const checkServerStatus = async () => {
    await checkAllServers();
  };

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const errors = {};
    const { email, password } = formData;

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Check if we're trying to login as admin in offline mode
      if (serverStatus.online === false && 
          formData.email === DEFAULT_ADMIN.email && 
          formData.password === DEFAULT_ADMIN.password) {
        // Handle offline admin login
        handleOfflineAdminLogin();
      } else {
        // Normal login with best available API
        login(formData.email, formData.password, serverStatus.activeApi);
      }
    }
  };

  // Add offline admin login function
  const handleOfflineAdminLogin = () => {
    // Create a mock admin user
    const mockAdminUser = {
      _id: 'offline-admin-id',
      name: 'Admin User',
      email: DEFAULT_ADMIN.email,
      role: 'admin',
      offlineMode: true
    };
    
    // Store in localStorage
    localStorage.setItem('offlineAdminUser', JSON.stringify(mockAdminUser));
    
    // Notify user
    alert('Logging in as admin in OFFLINE mode. Limited functionality will be available.');
    
    // Redirect to dashboard
    navigate('/');
  };

  // Fill admin credentials
  const fillAdminCredentials = () => {
    setFormData({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Admin Login
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
            {APP_NAME}
          </Typography>
          
          {serverStatus.online === false && (
            <Alert 
              severity="warning" 
              sx={{ width: '100%', mb: 2, mt: 1 }}
              action={
                <Button 
                  color="warning"
                  variant="outlined"
                  size="small"
                  onClick={checkServerStatus}
                  disabled={serverStatus.checking}
                  startIcon={serverStatus.checking ? <CircularProgress size={16} /> : <Refresh />}
                >
                  RETRY
                </Button>
              }
            >
              All server endpoints are offline. You can still login as admin in offline mode with limited functionality.
            </Alert>
          )}
          
          {serverStatus.online === true && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ width: '100%', mb: 2, mt: 1 }}
            >
              Connected to server
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
              placeholder="Enter your email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              placeholder="Enter your password"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Default Admin: {DEFAULT_ADMIN.email}
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              size="small"
              sx={{ mt: 1 }}
              onClick={fillAdminCredentials}
              disabled={loading}
            >
              Fill Admin Credentials
            </Button>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={loading || (serverStatus.online === false && formData.email !== DEFAULT_ADMIN.email)}
            >
              {loading ? <CircularProgress size={24} /> : 
               (serverStatus.online === false && formData.email === DEFAULT_ADMIN.email) ? 
               'LOGIN IN OFFLINE MODE' : 'LOGIN'}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active API: {serverStatus.activeApi || 'None'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1, mb: 2 }}>
                {API_URLS.map((url, index) => {
                  const apiStatus = apiCheckResults.find(r => r.url === url)?.status || 'unknown';
                  return (
                    <Chip 
                      key={index}
                      label={url.replace('https://', '').split('.')[0]}
                      size="small"
                      color={apiStatus === 'online' ? 'success' : apiStatus === 'checking' ? 'primary' : 'default'}
                      variant={url === serverStatus.activeApi ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>
              
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Register"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 