import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Title, Paragraph, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { LocationContext } from '../../context/LocationContext';

const HomeScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const { 
    location, 
    errorMsg, 
    isLoading, 
    checkedIn, 
    getCurrentLocation,
    checkIn,
    checkOut 
  } = useContext(LocationContext);
  const [initialRegion, setInitialRegion] = useState(null);
  
  // Get current location on component mount
  useEffect(() => {
    (async () => {
      const location = await getCurrentLocation();
      if (location) {
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    })();
  }, []);
  
  // Format time for display
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleCheckIn = async () => {
    await checkIn();
  };
  
  const handleCheckOut = async () => {
    await checkOut();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card style={styles.userCard}>
          <Card.Content style={styles.userCardContent}>
            <Avatar.Text 
              size={80} 
              label={userInfo?.name?.substring(0, 2).toUpperCase() || 'U'} 
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Title>Welcome, {userInfo?.name}</Title>
              <Paragraph>{userInfo?.designation || 'Staff'}</Paragraph>
              <Text>{formatTime()}</Text>
            </View>
          </Card.Content>
        </Card>
        
        {isLoading ? (
          <ActivityIndicator 
            size="large" 
            color="#2196F3" 
            style={styles.loading} 
          />
        ) : (
          <>
            <Card style={styles.mapCard}>
              <Card.Content>
                <Title>Current Location</Title>
                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}
                {initialRegion ? (
                  <View style={styles.mapContainer}>
                    <MapView 
                      style={styles.map}
                      initialRegion={initialRegion}
                      region={{
                        latitude: location?.coords.latitude || initialRegion.latitude,
                        longitude: location?.coords.longitude || initialRegion.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                    >
                      <Marker 
                        coordinate={{
                          latitude: location?.coords.latitude || initialRegion.latitude,
                          longitude: location?.coords.longitude || initialRegion.longitude,
                        }}
                        title="Your location"
                        description="This is your current location"
                      />
                    </MapView>
                  </View>
                ) : (
                  <Text>Loading map...</Text>
                )}
              </Card.Content>
            </Card>
            
            <Card style={styles.actionCard}>
              <Card.Content>
                <Title>Attendance</Title>
                <View style={styles.buttonContainer}>
                  <Button 
                    mode="contained" 
                    icon="login" 
                    onPress={handleCheckIn}
                    style={[styles.button, styles.checkInButton]}
                    disabled={checkedIn || isLoading}
                  >
                    Check In
                  </Button>
                  <Button 
                    mode="contained" 
                    icon="logout" 
                    onPress={handleCheckOut}
                    style={[styles.button, styles.checkOutButton]}
                    disabled={!checkedIn || isLoading}
                  >
                    Check Out
                  </Button>
                </View>
                <Text style={styles.statusText}>
                  Status: {checkedIn ? 'Checked In' : 'Checked Out'}
                </Text>
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
  userCard: {
    margin: 16,
    elevation: 4,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  mapCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  mapContainer: {
    height: 200,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#F44336',
  },
  statusText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 50,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});

export default HomeScreen; 