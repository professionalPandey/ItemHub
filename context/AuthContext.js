// @ts-nocheck
import React, { createContext, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged, initializeAuth } from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const AuthContext = createContext(/** @type {any} */ (null));

const firebaseConfig = Constants.expoConfig?.extra?.firebaseConfig;

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function AuthContextProvider(props) {
  /** @type {{ children: import('react').ReactNode }} */
  const { children } = props;
  const [user, setUser] = useState(/** @type {any} */ (null));
  const [authInstance, setAuthInstance] = useState(/** @type {any} */ (null));
  const [authReady, setAuthReady] = useState(false);
  const [deviceId, setDeviceId] = useState(/** @type {string | null} */ (null));

  const value = { user, setUser, authInstance, authReady, deviceId };

  useEffect(() => {
    /** @type {(() => void) | undefined} */
    let unsubscribe;

    const init = async () => {
      try {
        const app = getApps()[0];
        if (!authInstance) {
          let a;
          try {
            const {
              getReactNativePersistence,
            } = require('firebase/auth/react-native');
            a = initializeAuth(app, {
              persistence: getReactNativePersistence(AsyncStorage),
            });
          } catch (err) {
            console.warn(
              'React Native persistence adapter not available, falling back to memory persistence',
              err
            );
            a = initializeAuth(app);
          }

          setAuthInstance(a);
          setAuthReady(true);
          console.debug('Auth ready (web SDK)');
          unsubscribe = onAuthStateChanged(a, async (user) => {
            setUser(user);
            try {
              await SplashScreen.hideAsync();
            } catch (hideErr) {
              // ignore
            }
          });
        }
      } catch (e) {
        console.warn('Failed to initialize auth', e);
        try {
          await SplashScreen.hideAsync();
        } catch (hideErr) {
          // ignore
        }
      }
    };

    init();

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // ensure we have a persistent deviceId for this installation
  useEffect(() => {
    const ensureDeviceId = async () => {
      try {
        const key = '@ItemHub:deviceId';
        let id = await AsyncStorage.getItem(key);
        if (!id) {
          id = `rb-${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
          await AsyncStorage.setItem(key, id);
        }
        setDeviceId(id);
      } catch (e) {
        console.warn('Failed to load/store deviceId', e);
        setDeviceId(null);
      }
    };

    ensureDeviceId();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
