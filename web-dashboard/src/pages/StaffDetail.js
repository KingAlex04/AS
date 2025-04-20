import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  CircularProgress, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { API_URL } from '../utils/config';
import { useAuth } from '../context/AuthContext';

const StaffDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch staff details');
        }

        const data = await response.json();
        setStaff(data);

        // Fetch locations for this staff member
        const locationsResponse = await fetch(`${API_URL}/api/locations/user/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchStaffDetails();
    }
  }, [id, token]);

  const handleBack = () => {
    navigate('/staff');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Error: {error}
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Back to Staff List
        </Button>
      </Container>
    );
  }

  if (!staff) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff member not found
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Back to Staff List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff Details
        </Typography>
        <Button variant="contained" onClick={handleBack}>
          Back to Staff List
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {staff.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {staff.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {staff.role}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {staff.active ? 'Active' : 'Inactive'}
              </Typography>
              {staff.phone && (
                <Typography variant="body1" gutterBottom>
                  <strong>Phone:</strong> {staff.phone}
                </Typography>
              )}
              {staff.joinDate && (
                <Typography variant="body1" gutterBottom>
                  <strong>Join Date:</strong> {new Date(staff.joinDate).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Edit Details
              </Button>
              <Button size="small" color="error">
                {staff.active ? 'Deactivate' : 'Activate'} Account
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Recent Locations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {locations.length > 0 ? (
                <List>
                  {locations.slice(0, 5).map((location) => (
                    <ListItem key={location._id} divider>
                      <ListItemText
                        primary={new Date(location.timestamp).toLocaleString()}
                        secondary={`Lat: ${location.latitude}, Long: ${location.longitude}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1">No location data available</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                View All Locations
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StaffDetail; 