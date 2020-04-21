// React
import React, { useState, useEffect, useContext, useReducer } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { db, FieldPath } from "../App";

export function HomeScreen({ navigation }) {
  const appState = useContext(AppStateContext);
  const [lastCandidate, setLastCandidate] = useState(appState.userProfile.lastCandidate);
  const [allUsers, setAllUsers] = useReducer(allUsersReducer, []);

  function allUsersReducer(state, action) {
    if (action.name === "clean") {
      return [];
    }

    if (action.name === "init") {
      return [...action.newValue];
    } else {
      const newState = state.slice();
      setLastCandidate(newState[newState.length - 1].identity.userId);
      // set lastCandidate into bdd
      const userProfile = db
        .collection("users")
        .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
        .get();

      // @TODO use async
      userProfile
        .then(users => {
          users.forEach(docs => {
            docs.ref.update({
              "match.lastCandidate": newState[newState.length - 1].identity.userId,
            });
          });
        })
        .catch(error => {
          console.log(error);
        });

      newState.pop();

      if (newState.length === 0) {
        fetchAllProfiles();
      }

      if (action.name === "refuse") {
        // add userId to refuse list of currentUser
        const newRefuseList = appState.userProfile.refuse;
        newRefuseList.push(state[state.length - 1].identity.userId);
        appState.setUserProfile({
          refuse: newRefuseList,
        });
        const userProfile = db
          .collection("users")
          .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
          .get();

        // @TODO use async
        userProfile
          .then(users => {
            users.forEach(docs => {
              const newRefuseList = docs.data().match.refuse;
              newRefuseList.push(state[state.length - 1].identity.userId);
              docs.ref.update({
                "match.refuse": newRefuseList,
              });
            });
          })
          .catch(error => {
            console.log(error);
          });
      }

      if (action.name === "like") {
        // if other user already like current user
        if (state[state.length - 1].match.like.includes(appState.userProfile.userId)) {
          // add other user into likeReciprocal of current user
          const newLikeReciprocalList = appState.userProfile.likeReciprocal;
          newLikeReciprocalList.push(state[state.length - 1].identity.userId);
          appState.setUserProfile({
            likeReciprocal: newLikeReciprocalList,
          });
          // update current user profile into bdd
          const currentUserProfile = db
            .collection("users")
            .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
            .get();

          // @TODO use async
          currentUserProfile
            .then(users => {
              users.forEach(docs => {
                const newLikeReciprocalList = docs.data().match.likeReciprocal;
                newLikeReciprocalList.push(state[state.length - 1].identity.userId);
                docs.ref.update({
                  "match.likeReciprocal": newLikeReciprocalList,
                });
              });
            })
            .catch(error => {
              console.log(error);
            });
          // remove current user to like list of other user and add it to likeReciprocal too
          const otherUserProfile = db
            .collection("users")
            .where(new FieldPath("identity", "userId"), "==", state[state.length - 1].identity.userId)
            .get();

          // @TODO use async
          otherUserProfile
            .then(users => {
              users.forEach(docs => {
                const newLikeReciprocalList = docs.data().match.likeReciprocal;
                newLikeReciprocalList.push(appState.userProfile.userId);
                const newLikeList = docs.data().match.like;
                newLikeList.splice(newLikeList.indexOf(appState.userProfile.userId), 1);
                docs.ref.update({
                  "match.likeReciprocal": newLikeReciprocalList,
                  "match.like": newLikeList,
                });
              });
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          const newLikeList = appState.userProfile.like;
          newLikeList.push(state[state.length - 1].identity.userId);
          appState.setUserProfile({
            like: newLikeList,
          });
          const userProfile = db
            .collection("users")
            .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
            .get();

          // @TODO use async
          userProfile
            .then(users => {
              users.forEach(docs => {
                const newLikeList = docs.data().match.like;
                newLikeList.push(state[state.length - 1].identity.userId);
                docs.ref.update({
                  "match.like": newLikeList,
                });
              });
            })
            .catch(error => {
              console.log(error);
            });
        }
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
    if (lastCandidate) {
      console.log("last candidate true");
      const query = await db
        .collection("users")
        .orderBy(new FieldPath("identity", "userId"))
        .startAt(lastCandidate)
        // .where(new FieldPath("identity", "gender"), "==", appState.userProfile.whatIWant.gender)
        // .where(new FieldPath("identity", "sexualOrientation"), "==", appState.userProfile.whatIWant.sexualOrientation)
        // .where(new FieldPath("identity", "city"), "==", appState.userProfile.whatIWant.city)
        .limit(5)
        .get();

      const newAllUsers = [];

      query.forEach(user => {
        const userData = user.data();

        if (!appState.userProfile.refuse.includes(userData.identity.userId) && !appState.userProfile.like.includes(userData.identity.userId) && !appState.userProfile.likeReciprocal.includes(userData.identity.userId)) {
          newAllUsers.push(userData);
        }
      });
      setAllUsers({ name: "init", newValue: newAllUsers.reverse() });
    } else {
      console.log("last candidate false");
      const query = await db
        .collection("users")
        .orderBy(new FieldPath("identity", "userId"))
        // .where(new FieldPath("identity", "gender"), "==", appState.userProfile.whatIWant.gender)
        // .where(new FieldPath("identity", "sexualOrientation"), "==", appState.userProfile.whatIWant.sexualOrientation)
        // .where(new FieldPath("identity", "city"), "==", appState.userProfile.whatIWant.city)
        .limit(5)
        .get();

      const newAllUsers = [];

      query.forEach(user => {
        const userData = user.data();

        if (!appState.userProfile.refuse.includes(userData.identity.userId) && !appState.userProfile.like.includes(userData.identity.userId) && !appState.userProfile.likeReciprocal.includes(userData.identity.userId)) {
          newAllUsers.push(userData);
        }
      });
      setAllUsers({ name: "init", newValue: newAllUsers.reverse() });
    }
  }

  useEffect(() => {
    fetchAllProfiles();
    return setAllUsers({ name: "clean" });
  }, []);

  console.log("allUsers");
  console.log(allUsers);
  console.log("lastCandidate");
  console.log(lastCandidate);

  return (
    <>
      <View style={styles.containerCenter}>
        <Image style={styles.image} source={{ uri: allUsers[0] ? allUsers[allUsers.length - 1].identity.photos[0] : "https://via.placeholder.com/150" }} />
        <Text style={styles.title}>{allUsers[0] ? allUsers[allUsers.length - 1].identity.displayName : ""}</Text>
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
  image: {
    flex: 1,
    marginTop: 20,
    marginBottom: 20,
  },
});
