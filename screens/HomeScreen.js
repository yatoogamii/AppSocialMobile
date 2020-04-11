import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { AppStateContext } from "../App";

export function HomeScreen({ navigation }) {
  const appState = useContext(AppStateContext);
  if (appState.userProfile.isNewUser) {
    navigation.navigate("CompleteProfile");
  }

  async function logout() {
    try {
      /* await firebase.auth().signOut(); */
      appState.setLogged(false);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View style={styles.containerCenter}>
      <Text style={styles.title}>Hello ! Bienvenue dans le Home</Text>
      <Button title="Log out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    marginHorizontal: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
});
