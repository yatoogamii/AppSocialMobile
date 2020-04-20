// React
import React, { useState, useEffect, useContext, useReducer } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { db, FieldPath } from "../App";

export function HomeScreen({ navigation }) {
  const appState = useContext(AppStateContext);
  const [allUsers, setAllUsers] = useReducer(allUsersReducer, []);

  function allUsersReducer(state, action) {
    if (action.name === "init") {
      return [...state, action.newValue];
    } else {
      const newState = state.slice();
      newState.pop();

      if (action.name === "refuse") {
        // add userId to refuse list of currentUser
        const newRefuseList = appState.userProfile.refuse;
        newRefuseList.push(state[state.length - 1].identity.userId);
        appState.setUserProfile({
          refuse: newRefuseList,
        });
      }

      if (action.name === "like") {
      }

      return newState;
    }
  }

  async function logout() {
    try {
      await auth().signOut();
      appState.setLogged(false);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchAllProfiles() {
    // gender
    // sexual
    // age
    // city
    // country
    // hobbies
    const allUsers = await db
      .collection("users")
      .where(
        new FieldPath("identity", "gender"),
        "==",
        appState.userProfile.whatIWant.gender,
      )
      .where(
        new FieldPath("identity", "sexualOrientation"),
        "==",
        appState.userProfile.whatIWant.sexualOrientation,
      )
      .where(
        new FieldPath("identity", "city"),
        "==",
        appState.userProfile.whatIWant.city,
      )
      .get();

    allUsers.forEach(user => {
      setAllUsers({ name: "init", newValue: user.data() });
    });
  }

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  console.log(allUsers);
  return (
    <>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>
          {allUsers[0]
            ? allUsers[allUsers.length - 1].identity.displayName
            : ""}
        </Text>
        <Button title="Yes" onPress={() => setAllUsers({ name: "like" })} />
        <Button title="No" onPress={() => setAllUsers({ name: "refuse" })} />
      </View>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Hello ! Bienvenue dans le Home</Text>
        <Button title="Log out" onPress={logout} />
      </View>
    </>
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
