import React, { useContext } from "react";
import { StyleSheet, Text, Pressable } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { AuthContext } from "../context/AuthContext";

const handleLogout = async (setUser) => {
  const auth = getAuth();
  const user = auth.currentUser;

  try {
    const db = getDatabase();
    const userRef = ref(db, `activeUsers/${user.uid}`);
    setUser(null);
    await set(userRef, null);
    await signOut(auth);
  } catch (error) {
    console.warn("Error during logout: ", error.message);
  }
};

const LogoutButton = () => {
  const { setUser } = useContext(AuthContext);

  return (
    <Pressable
      onPress={handleLogout.bind(this, setUser)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>Logout</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ff6666",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LogoutButton;
