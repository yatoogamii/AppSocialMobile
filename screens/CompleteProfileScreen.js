import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { AppStateContext, db, FieldPath } from "../App";

export function CompleteProfileScreen() {
  const appState = useContext(AppStateContext);

  async function UpdateProfile() {
    try {
      appState.setUserProfile({
        profileComplete: true,
      });

      const userProfile = await db
        .collection("users")
        .where(
          new FieldPath("identity", "userId"),
          "==",
          appState.userProfile.userId,
        )
        .get();

      userProfile.forEach(docs => {
        docs.ref.update({
          "permissions.profileComplete": true,
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View style={styles.containerCenter}>
      <Text style={styles.title}>Veuillez completer votre profile</Text>
      <Button title="Finaliser le profil" onPress={UpdateProfile} />
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
