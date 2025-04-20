import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';

const DashboardScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeStaff: 0,
    activeCompany: 0,
    checkins: 0,
    checkouts: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch active users count
      const activeUsersResponse = await axios.get(`${API_URL}/api/users/active`);
      
      // Fetch today's checkins and checkouts
      const todayLocationsResponse = await axios.get(`${API_URL}/api/locations/today`);
      
      // Fetch recent activities
      const recentActivitiesResponse = await axios.get(`${API_URL}/api/locations/recent?limit=10`);
      
      // Update state with fetched data
      setStats({
        activeStaff: activeUsersResponse.data.data.activeStaff,
        activeCompany: activeUsersResponse.data.data.activeCompany,
        checkins: todayLocationsResponse.data.data.checkins,
        checkouts: todayLocationsResponse.data.data.checkouts
      });
      
      setRecentActivities(recentActivitiesResponse.data.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format location type for display
  const formatLocationType = (type) => {
    switch (type) {
      case 'checkin':
        return 'Checked In';
      case 'checkout':
        return 'Checked Out';
      default:
        return 'Location Updated';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.companyCard}>
          <Card.Content style={styles.companyCardContent}>
            <Avatar.Text 
              size={60} 
              label={userInfo?.name?.substring(0, 2).toUpperCase() || 'C'} 
              style={styles.avatar}
            />
            <View style={styles.companyInfo}>
              <Title>Welcome, {userInfo?.name}</Title>
              <Paragraph>Company Admin</Paragraph>
            </View>
          </Card.Content>
        </Card>
        
        {isLoading && !refreshing ? (
          <ActivityIndicator 
            size="large" 
            color="#2196F3" 
            style={styles.loading} 
          />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                mode="contained" 
                onPress={fetchDashboardData} 
                style={styles.retryButton}
              >
                Retry
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Card style={styles.statsCard}>
                <Card.Content>
                  <Title style={styles.statsValue}>{stats.activeStaff}</Title>
                  <Paragraph>Active Staff</Paragraph>
                </Card.Content>
              </Card>
              
              <Card style={styles.statsCard}>
                <Card.Content>
                  <Title style={styles.statsValue}>{stats.checkins}</Title>
                  <Paragraph>Today's Check-ins</Paragraph>
                </Card.Content>
              </Card>
            </View>
            
            <View style={styles.statsContainer}>
              <Card style={styles.statsCard}>
                <Card.Content>
                  <Title style={styles.statsValue}>{stats.checkouts}</Title>
                  <Paragraph>Today's Check-outs</Paragraph>
                </Card.Content>
              </Card>
              
              <Card style={styles.statsCard}>
                <Card.Content>
                  <Title style={styles.statsValue}>
                    {stats.checkins - stats.checkouts > 0 ? stats.checkins - stats.checkouts : 0}
                  </Title>
                  <Paragraph>Currently Active</Paragraph>
                </Card.Content>
              </Card>
            </View>
            
            <Card style={styles.activitiesCard}>
              <Card.Content>
                <Title>Recent Activities</Title>
                {recentActivities.length === 0 ? (
                  <Text style={styles.noActivitiesText}>No recent activities</Text>
                ) : (
                  recentActivities.map((activity, index) => (
                    <Card key={activity._id} style={styles.activityItem}>
                      <Card.Content>
                        <View style={styles.activityContent}>
                          <Avatar.Text 
                            size={40} 
                            label={activity.userId?.name?.substring(0, 2).toUpperCase() || 'U'} 
                            style={styles.activityAvatar}
                          />
                          <View style={styles.activityInfo}>
                            <Text style={styles.activityName}>
                              {activity.userId?.name || 'Unknown User'}
                            </Text>
                            <Text style={styles.activityType}>
                              {formatLocationType(activity.type)}
                            </Text>
                            <Text style={styles.activityTime}>
                              {formatDate(activity.timestamp)}
                            </Text>
                            {activity.address ? (
                              <Text style={styles.activityAddress}>
                                {activity.address}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  companyCard: {
    margin: 16,
    elevation: 4,
  },
  companyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 8,
    elevation: 4,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2196F3',
  },
  activitiesCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  activityItem: {
    marginTop: 8,
    elevation: 2,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAvatar: {
    backgroundColor: '#4CAF50',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontWeight: 'bold',
  },
  activityType: {
    color: '#2196F3',
  },
  activityTime: {
    color: '#757575',
    fontSize: 12,
  },
  activityAddress: {
    fontSize: 12,
    marginTop: 4,
  },
  loading: {
    marginTop: 50,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#FFEBEE',
    elevation: 4,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
  noActivitiesText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#757575',
  },
});

export default DashboardScreen; 