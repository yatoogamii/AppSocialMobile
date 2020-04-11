// React
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { db } from "../App.js";

export function SignUpScreen({ navigation }) {
  const [userMail, setUserMail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setErrorMessage] = useState({ code: "", message: "" });
  const appState = useContext(AppStateContext);

  async function signUp() {
    try {
      // create user
      const response = await auth().createUserWithEmailAndPassword(
        userMail,
        userPassword,
      );
      appState.setUserProfile({
        isNewUser: response.additionalUserInfo.isNewUser,
      });

      // create doc with new user
      const newUser = await db.collection("users").add({
        email: response.user.email,
        displayName: response.user.displayName,
        phone: response.user.phoneNumber,
        photoURL: response.user.photoURL,
        tokenId: await response.user.getIdToken(),
      });

      // logged
      appState.setLogged(true);
    } catch (e) {
      console.log(e);
      setErrorMessage({ code: e.code, message: e.message });
    }
  }

  return (
    <View style={styles.containerCenter}>
      <View style={styles.containerForm}>
        {error.code === "auth/operation-not-allowed" && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <TextInput
          onChangeText={inputValue => setUserMail(inputValue)}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="jon.doe@gmail.com"
        />
        {(error.code === "auth/invalid-email" ||
          error.code === "auth/email-already-in-use") && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <TextInput
          onChangeText={inputValue => setUserPassword(inputValue)}
          style={styles.input}
          autoCapitalize="none"
          textContentType="password"
          placeholder="password"
        />
        {error.code === "auth/weak-password" && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <Button title="Créer un compte" onPress={signUp} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  input: {
    borderWidth: 0.5,
    borderColor: "#1d1d1d",
    padding: 10,
    marginBottom: 10,
  },
  containerForm: {
    marginHorizontal: 40,
  },
  text: {
    marginTop: 10,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
});
