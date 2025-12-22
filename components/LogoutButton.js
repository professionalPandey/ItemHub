import React, { useContext } from 'react';
import { StyleSheet, Text, Pressable, Platform } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { AuthContext } from '../context/AuthContext';

const handleLogout = async (setUser, authInstance, authReady, deviceId) => {
  if (!authReady || !authInstance) {
    console.warn('Auth not ready for logout');
    return;
  }

  try {
    // Determine current user and sign-out method depending on SDK
    const currentUser =
      authInstance.currentUser ||
      (authInstance?.auth && authInstance.auth().currentUser);

    // Remove active user record while still authenticated (rules often require auth.uid === $uid)
    if (currentUser && currentUser.uid) {
      const db = getDatabase();
      const userRef = ref(db, `activeUsers/${currentUser.uid}`);
      try {
        // Only clear the activeUsers entry if it belongs to this device
        const snapshot = await (async () => {
          try {
            const { get } = require('firebase/database');
            return await get(userRef);
          } catch (e) {
            // fallback to imported get if require not available
            const { get: getFn } = require('firebase/database');
            return await getFn(userRef);
          }
        })();

        if (snapshot && snapshot.exists()) {
          const val = snapshot.val();
          const myDeviceId = deviceId || 'unknown-device';
          if (val.deviceId === myDeviceId) {
            await set(userRef, null);
          }
        }
      } catch (dbErr) {
        console.warn('Failed to clear activeUsers entry during logout:', dbErr);
      }
    }

    // Sign out using whichever API is available
    if (typeof authInstance.signOut === 'function') {
      await authInstance.signOut();
    } else {
      // web SDK compatible
      const { signOut } = require('firebase/auth');
      await signOut(authInstance);
    }

    // update local state after successful sign-out
    setUser(null);
  } catch (error) {
    console.warn('Error during logout: ', error?.message || error);
  }
};

const LogoutButton = () => {
  const { setUser, authInstance, authReady, deviceId } =
    useContext(AuthContext);

  return (
    <Pressable
      onPress={() => handleLogout(setUser, authInstance, authReady, deviceId)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff6666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: '#ff5252',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogoutButton;
