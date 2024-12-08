import React, { useLayoutEffect } from "react";
import { Text, StyleSheet, Image } from "react-native";
import Container from "../components/Container";
import LogoutButton from "../components/LogoutButton";

const DetailsScreen = ({ route, navigation }) => {
  const { user } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <LogoutButton />,
      headerTitle: `${user.name.first} ${user.name.last}`,
      headerTitleAlign: "left",
    });
  }, [navigation]);

  return (
    <Container style={styles.container}>
      <Image source={{ uri: user.picture.large }} style={styles.image} />
      <Text style={styles.email}>Email: {user.email}</Text>
      <Text style={styles.age}>Age: {user.dob.age}</Text>
      <Text style={styles.location}>
        Location: {user.location.city}, {user.location.state},{" "}
        {user.location.country}
      </Text>
    </Container>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginVertical: 8,
  },
  age: {
    fontSize: 16,
    marginVertical: 8,
  },
  location: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
});
