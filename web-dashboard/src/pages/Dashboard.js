import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../utils/config';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeStaff: 0,
    activeCompany: 0,
    todaysCheckins: 0,
    todaysCheckouts: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user stats
        const statsRes = await axios.get(`${API_URL}/api/users/active`);
        
        // Fetch today's check-ins and check-outs
        const todayRes = await axios.get(`${API_URL}/api/locations/today`);
        
        // Fetch recent activities
        const recentRes = await axios.get(`${API_URL}/api/locations/recent?limit=10`);

        setStats({
          activeStaff: statsRes.data.data.activeStaff,
          activeCompany: statsRes.data.data.activeCompany,
          todaysCheckins: todayRes.data.data.checkins,
          todaysCheckouts: todayRes.data.data.checkouts,
        });

        setRecentActivities(recentRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
  };

  // Get location type badge
  const getLocationTypeBadge = (type) => {
    switch (type) {
      case 'checkin':
        return <Chip icon={<LoginIcon />} label="Check In" color="success" size="small" />;
      case 'checkout':
        return <Chip icon={<LogoutIcon />} label="Check Out" color="error" size="small" />;
      default:
        return <Chip label="Location Update" color="primary" size="small" />;
    }
  };

  // User greeting message
  const getGreeting = () => {
    const hours = new Date().getHours();
    let greeting = 'Good Morning';
    
    if (hours >= 12 && hours < 17) {
      greeting = 'Good Afternoon';
    } else if (hours >= 17) {
      greeting = 'Good Evening';
    }
    
    return `${greeting}, ${user?.name || 'User'}!`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        {getGreeting()}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to your dashboard
      </Typography>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Active Staff</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.activeStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="h6">Active Companies</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.activeCompany}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <LoginIcon />
                </Avatar>
                <Typography variant="h6">Today's Check-ins</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.todaysCheckins}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <LogoutIcon />
                </Avatar>
                <Typography variant="h6">Today's Check-outs</Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.todaysCheckouts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent activities */}
      <Paper elevation={2} sx={{ mt: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Recent Activities</Typography>
        </Box>
        <Divider />
        {recentActivities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No recent activities found
            </Typography>
          </Box>
        ) : (
          <List>
            {recentActivities.map((activity) => (
              <React.Fragment key={activity._id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar alt={activity.userId?.name || 'User'}>
                      {activity.userId?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography component="span" variant="body1" fontWeight="bold">
                          {activity.userId?.name || 'Unknown User'}
                        </Typography>
                        {getLocationTypeBadge(activity.type)}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {activity.address || 'Location data not available'}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard; 