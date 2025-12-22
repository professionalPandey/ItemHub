import { useContext, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, set, remove, off } from 'firebase/database';
import { Alert } from 'react-native';
import * as Device from 'expo-device';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);
  const activeUserRefRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const auth = getAuth();
    const db = getDatabase();

    const trackAndMonitor = async () => {
      try {
        // Track current user session
        const sessionData = {
          email: user.email,
          deviceId: Device.osBuildId || Device.modelId || 'Unknown Device',
          timestamp: Date.now(),
        };

        activeUserRefRef.current = ref(db, `activeUsers/${user.uid}`);
        await set(activeUserRefRef.current, sessionData);

        // Monitor for changes (notification-based, not polling)
        unsubscribeRef.current = onValue(
          activeUserRefRef.current,
          (snapshot) => {
            const activeUser = snapshot.val();
            const currentDeviceId = Device.osBuildId || Device.modelId;

            // Only trigger logout if a DIFFERENT device is detected
            if (activeUser && activeUser.deviceId !== currentDeviceId) {
              handleForcedLogout(user.uid);
            }
          },
          (error) => {
            console.error('Monitoring error:', error);
          }
        );
      } catch (error) {
        console.error('Error in trackAndMonitor:', error);
      }
    };

    const handleForcedLogout = async (userId) => {
      try {
        await remove(activeUserRefRef.current);
        signOut(auth);
        setUser(null);
        Alert.alert(
          'You have been logged out',
          'Your account is active on another device.'
        );
      } catch (error) {
        console.error('Forced logout error:', error);
      }
    };

    trackAndMonitor();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (activeUserRefRef.current) {
        off(activeUserRefRef.current);
      }
    };
  }, [user, setUser]);

  return null;
};

export default useAuth;
