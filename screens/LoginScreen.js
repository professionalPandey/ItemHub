import React, { useContext, useState } from 'react';
import {
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/Container';
import { getDatabase, ref, set, get, runTransaction } from 'firebase/database';
import * as Device from 'expo-device';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser, authInstance, authReady, deviceId } =
    useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    if (!authReady || !authInstance) {
      setError('Auth not ready yet. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    try {
      let userCredential;

      // If native RNFB instance (has signInWithEmailAndPassword on instance)
      if (typeof authInstance.signInWithEmailAndPassword === 'function') {
        // @ts-ignore
        userCredential = await authInstance.signInWithEmailAndPassword(
          email,
          password
        );
      } else {
        // web SDK
        userCredential = await signInWithEmailAndPassword(
          authInstance,
          email,
          password
        );
      }

      const userObj = userCredential.user || userCredential;
      setUser(userObj);

      const db = getDatabase();
      const activeUserRef = ref(db, `activeUsers/${userObj.uid}`);

      // Use a transaction to claim the activeUsers slot only if empty or owned by this deviceId
      const myDeviceId =
        deviceId || Device.osBuildId || Device.modelId || 'Unknown Device';

      try {
        const txResult = await runTransaction(activeUserRef, (current) => {
          if (current === null) {
            return {
              email: userObj.email,
              deviceId: myDeviceId,
              timestamp: Date.now(),
            };
          }
          // already owned by this device -> refresh timestamp
          if (current.deviceId === myDeviceId) {
            return {
              ...current,
              email: userObj.email,
              timestamp: Date.now(),
            };
          }
          // owned by another device -> abort transaction by returning undefined
          return undefined;
        });

        // txResult.committed === false means another device holds it
        if (!txResult?.committed) {
          setError(
            'Account is active on another device. Sign out there first.'
          );
          setLoading(false);
          return;
        }
      } catch (txErr) {
        console.warn(
          'Transaction error while claiming activeUsers slot',
          txErr
        );
        setError(
          'Unable to verify active device (permission issue). Try again later.'
        );
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder='Email'
          placeholderTextColor='#888'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
        />
        <TextInput
          style={styles.input}
          placeholder='Password'
          placeholderTextColor='#888'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size='large' color='#007bff' />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 50,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  signupText: {
    textAlign: 'center',
    color: '#007bff',
    fontSize: 16,
  },
});
