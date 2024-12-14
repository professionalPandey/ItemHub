import { createContext, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  onAuthStateChanged,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const AuthContext = createContext();

const firebaseConfig = Constants.expoConfig.extra.firebaseConfig;

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = initializeAuth(getApps()[0], {
  persistence: getReactNativePersistence(AsyncStorage),
});

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = { user, setUser };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await SplashScreen.hideAsync();
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
