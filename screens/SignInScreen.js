// env
import { FACEBOOK_APP_ID, FACEBOOK_APP_NAME } from "react-native-dotenv";

// react
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { LoginManager, AccessToken } from "react-native-fbsdk";
import { db } from "../App.js";

export function SignInScreen({ navigation }) {
  const [userMail, setUserMail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setErrorMessage] = useState({ code: "", message: "" });
  const appState = useContext(AppStateContext);

  async function signInByEmail() {
    try {
      if (!userMail.trim())
        throw { code: "auth/invalid-email", message: "Mail obligatoire" };
      if (!userPassword.trim())
        throw { code: "auth/wrong-password", message: "Password obligatoire" };

      const response = await auth().signInWithEmailAndPassword(
        userMail,
        userPassword,
      );
      appState.setUserProfile({
        isNewUser: response.additionalUserInfo.isNewUser,
      });
      appState.setLogged(true);
    } catch (e) {
      console.log(e);
      setErrorMessage({ code: e.code, message: e.message });
    }
  }

  async function signInByFacebook() {
    try {
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
        "user_gender",
        "user_location",
      ]);
      if (result.isCancelled) {
        throw {
          code: "auth/facebook",
          message: "User cancelled the login process",
        };
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw {
          code: "auth/facebook",
          message: "Something went wrong obtaining access token",
        };
      }
      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );
      // Sign-in the user with the credential
      const response = await auth().signInWithCredential(facebookCredential);
      appState.setUserProfile({
        isNewUser: response.additionalUserInfo.isNewUser,
      });

      if (response.additionalUserInfo.isNewUser) {
        // create doc with new user
        const newUser = await db.collection("users").add({
          email: response.user.email,
          displayName: response.user.displayName,
          phone: response.user.phoneNumber,
          photoURL: response.user.photoURL,
          tokenId: await response.user.getIdToken(),
        });
      }

      appState.setLogged(true);
    } catch (e) {
      console.log(e);
      setErrorMessage({ code: e.code, message: e.message });
    }
  }

  return (
    <View style={styles.containerCenter}>
      <View style={styles.containerForm}>
        {(error.code === "auth/user-not-found" ||
          error.code === "auth/user-disabled" ||
          error.code === "auth/facebook") && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <TextInput
          style={styles.input}
          onChangeText={inputValue => setUserMail(inputValue)}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="jon.doe@gmail.com"
        />
        {error.code === "auth/invalid-email" && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <TextInput
          style={styles.input}
          onChangeText={inputValue => setUserPassword(inputValue)}
          autoCapitalize="none"
          textContentType="password"
          placeholder="password"
          secureTextEntry={true}
        />
        {error.code === "auth/wrong-password" && (
          <Text style={{ color: "red" }}>{error.message}</Text>
        )}
        <View>
          <Button title="Se connecter" onPress={signInByEmail} />
        </View>
        <View style={styles.button}>
          <Button
            title="Se connecter par Facebook"
            color="blue"
            onPress={signInByFacebook}
          />
        </View>
        <Text style={styles.text} onPress={() => navigation.navigate("SignUp")}>
          Vous voulez créer un compte ?
        </Text>
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
  button: {
    paddingTop: 5,
  },
  containerForm: {
    marginHorizontal: 40,
  },
  text: {
    marginTop: 10,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
  textLoading: {
    textAlign: "center",
    marginBottom: 40,
  },
});
