import { useContext, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, onValue, set, remove, off } from "firebase/database";
import { Alert } from "react-native";
import * as Device from "expo-device";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();
    let activeUserRef;

    const handleForcedLogout = async (userId) => {
      try {
        const userRef = ref(db, `activeUsers/${userId}`);
        await remove(userRef);

        Alert.alert(
          "You have been logged out",
          "Your account is active on another device."
        );

        signOut(auth);
        setUser(null);
      } catch (error) {
        console.error("Error during forced logout:", error);
      }
    };

    const trackActiveUser = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) return;

        activeUserRef = ref(db, `activeUsers/${currentUser.uid}`);
        const sessionData = {
          email: currentUser.email,
          deviceId: Device.osBuildId || Device.modelId || "Unknown Device",
          timestamp: Date.now(),
        };

        await set(activeUserRef, sessionData);
        console.log("Active user tracked successfully!");
      } catch (error) {
        console.error("Error tracking active user:", error);
      }
    };

    const monitorSession = () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      activeUserRef = ref(db, `activeUsers/${currentUser.uid}`);

      const unsubscribe = onValue(activeUserRef, (snapshot) => {
        const activeUser = snapshot.val();

        if (
          !activeUser ||
          activeUser.deviceId === (Device.osBuildId || Device.modelId)
        ) {
          return;
        }

        handleForcedLogout(currentUser.uid);
      });

      return () => {
        if (activeUserRef) off(activeUserRef);
      };
    };

    if (user) {
      trackActiveUser();
      const unsubscribe = monitorSession();

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user]);

  return null;
};

export default useAuth;
