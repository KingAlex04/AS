import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { APP_NAME } from '../../config';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, isLoading, error } = useContext(AuthContext);
  
  const handleRegister = () => {
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    } else {
      setPasswordError('');
    }
    
    // Register user
    register({
      name,
      email,
      password,
      phoneNumber,
      designation
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <Title style={styles.title}>Create Account</Title>
          <Text style={styles.subtitle}>Join {APP_NAME}</Text>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            left={<TextInput.Icon name="account" />}
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon name="email" />}
          />
          
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon name="phone" />}
          />
          
          <TextInput
            label="Designation"
            value={designation}
            onChangeText={setDesignation}
            style={styles.input}
            left={<TextInput.Icon name="badge-account" />}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={secureTextEntry}
            left={<TextInput.Icon name="lock" />}
            right={
              <TextInput.Icon 
                name={secureTextEntry ? "eye" : "eye-off"} 
                onPress={() => setSecureTextEntry(!secureTextEntry)} 
              />
            }
          />
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={confirmSecureTextEntry}
            left={<TextInput.Icon name="lock-check" />}
            right={
              <TextInput.Icon 
                name={confirmSecureTextEntry ? "eye" : "eye-off"} 
                onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)} 
              />
            }
            error={!!passwordError}
          />
          
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
          
          <Button 
            mode="contained" 
            onPress={handleRegister} 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              "Register"
            )}
          </Button>
          
          <View style={styles.loginContainer}>
            <Text>Already have an account? </Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              Login
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  surface: {
    padding: 24,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});

export default RegisterScreen; 