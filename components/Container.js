import React from "react";
import { View, StyleSheet } from "react-native";

const Container = ({ children, style = null }) => {
  return <View style={style ?? styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});

export default Container;
