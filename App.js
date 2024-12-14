import React, { useContext } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthContextProvider, { AuthContext } from "./context/AuthContext";
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

function Navigation() {
  const { user } = useContext(AuthContext);
  return (
    <NavigationContainer>
      {!user ? <AuthStackScreens /> : <FeatureStackScreens />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <Provider store={store}>
        <StatusBar style="dark" />
        <Navigation />
      </Provider>
    </AuthContextProvider>
  );
}
