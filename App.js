import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { getApps, initializeApp } from "firebase/app";
import { onAuthStateChanged, initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence } from "firebase/auth";
import { AuthContext } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import store from "./store";
import { Provider } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useAuth from "./hooks/useAuth";

SplashScreen.preventAutoHideAsync();

const firebaseConfig = {
  apiKey: "AIzaSyAbdwNS8uqzmSPpwA9vpWsAuEnwDs53KI4",
  authDomain: "itemhub.firebaseapp.com",
  databaseURL:
    "https://itemhub-687d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "itemhub-687d8",
  storageBucket: "itemhub-687d8.appspot.com",
  messagingSenderId: "601748750117",
  appId:
    "1:601748750117:web:BM4cMxd_Oqomv5Fy3Se5F8VlWsy0pvNusp-pd6C78w0xB4ZpdmY7yXF_6XvAg2KQg-dg8Z88JOU-WH6DFSFexWY",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = initializeAuth(getApps()[0], {
  persistence: getReactNativePersistence(AsyncStorage),
});

const AuthStack = createNativeStackNavigator();
const FeatureStack = createNativeStackNavigator();

function AuthStackScreens() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function FeatureStackScreens() {
  useAuth();
  return (
    <FeatureStack.Navigator initialRouteName="Home">
      <FeatureStack.Screen name="Home" component={HomeScreen} />
      <FeatureStack.Screen name="UserDetail" component={DetailsScreen} />
    </FeatureStack.Navigator>
  );
}

function Navigation({ user }) {
  return (
    <NavigationContainer>
      {!user ? <AuthStackScreens /> : <FeatureStackScreens />}
    </NavigationContainer>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const value = { user, setUser };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      await SplashScreen.hideAsync();
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      <Provider store={store}>
        <Navigation user={user} />
        <StatusBar style="dark" />
      </Provider>
    </AuthContext.Provider>
  );
}
