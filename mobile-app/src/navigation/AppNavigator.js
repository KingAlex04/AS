import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Staff Screens
import HomeScreen from '../screens/staff/HomeScreen';
import LocationHistoryScreen from '../screens/staff/LocationHistoryScreen';
import ProfileScreen from '../screens/staff/ProfileScreen';

// Company Admin Screens
import DashboardScreen from '../screens/company/DashboardScreen';
import StaffListScreen from '../screens/company/StaffListScreen';
import StaffDetailsScreen from '../screens/company/StaffDetailsScreen';
import CompanyProfileScreen from '../screens/company/CompanyProfileScreen';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator (when not logged in)
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Staff Tab Navigator (for staff users)
const StaffTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{
        headerShown: true,
        title: 'Staff Dashboard'
      }}
    />
    <Tab.Screen 
      name="History" 
      component={LocationHistoryScreen} 
      options={{
        headerShown: true,
        title: 'My Locations'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{
        headerShown: true,
        title: 'My Profile'
      }}
    />
  </Tab.Navigator>
);

// Company Admin Tab Navigator
const CompanyTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'Staff') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'business' : 'business-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{
        headerShown: true,
        title: 'Company Dashboard'
      }}
    />
    <Tab.Screen 
      name="Staff" 
      component={StaffNavigator}
      options={{
        headerShown: false,
        title: 'Staff Management'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={CompanyProfileScreen} 
      options={{
        headerShown: true,
        title: 'Company Profile'
      }}
    />
  </Tab.Navigator>
);

// Staff Management Navigator (for company admins)
const StaffNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="StaffList" 
      component={StaffListScreen} 
      options={{
        title: 'Staff List'
      }}
    />
    <Stack.Screen 
      name="StaffDetails" 
      component={StaffDetailsScreen} 
      options={{
        title: 'Staff Details'
      }}
    />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { userToken, userInfo } = useContext(AuthContext);
  
  // Determine which navigator to show based on authentication and user role
  if (!userToken) {
    return <AuthNavigator />;
  } else if (userInfo?.role === 'company') {
    return <CompanyTabNavigator />;
  } else {
    return <StaffTabNavigator />;
  }
};

export default AppNavigator; 