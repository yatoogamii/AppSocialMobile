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
  const [allCandidates, setAllCandidates] = useState([]);

  async function refuseCandidate() {
    try {
      updateLastCandidate();

      const newAllCandidates = Array.from(allCandidates);

      // add userId to refuse list of currentUser
      const newRefuseList = appState.userProfile.refuse;
      newRefuseList.push(newAllCandidates[newAllCandidates.length - 1].identity.userId);
      appState.setUserProfile({
        refuse: newRefuseList,
      });

      // get current user
      const userProfile = await db
        .collection("users")
        .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
        .get();

      // update match refuse list of current user into bdd
      userProfile.forEach(docs => {
        const newRefuseList = docs.data().match.refuse;
        newRefuseList.push(newAllCandidates[newAllCandidates.length - 1].identity.userId);
        docs.ref.update({
          "match.refuse": newRefuseList,
        });
      });

      // remove refused candidate
      newAllCandidates.splice(newAllCandidates.length - 1, 1);

      if (newAllCandidates.length === 0) {
        fetchAllProfiles();
      }

      // update allCandidates without refused candidate
      setAllCandidates(newAllCandidates);
    } catch (e) {
      console.log(e);
    }
  }

  async function likeCandidate() {
    try {
      updateLastCandidate();

      const newAllCandidates = Array.from(allCandidates);
      let currentUserProfile = {};

      const userProfile = await db
        .collection("users")
        .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
        .get();

      userProfile.forEach(docs => {
        const newLikeList = docs.data().match.like;
        newLikeList.push(allCandidates[allCandidates.length - 1].identity.userId);
        docs.ref.update({
          "match.like": newLikeList,
        });

        currentUserProfile = docs.data();
      });

      // if other user already like current user
      if (allCandidates[allCandidates.length - 1].match.like.includes(appState.userProfile.userId)) {
        // create match document

        // matches
        await db.collection("matches").add({
          // @1 create variable for this and re used it
          // @2 add ref of candidate and currentUser profile
          participantsId: [appState.userProfile.userId, allCandidates[allCandidates.length - 1].identity.userId],
          participantsProfile: [allCandidates[allCandidates.length - 1], currentUserProfile],
          messages: [],
        });

        const newMatchesList = appState.userProfile.matches;
        newMatchesList.push({
          // @1 create variable for this and re used it
          participantsId: [appState.userProfile.userId, allCandidates[allCandidates.length - 1].identity.userId],
          participantsProfile: [allCandidates[allCandidates.length - 1], currentUserProfile],
          messages: [],
        });

        appState.setUserProfile({
          messages: newMatchesList,
        });
      }

      const newLikeList = appState.userProfile.like;
      newLikeList.push(allCandidates[allCandidates.length - 1].identity.userId);
      appState.setUserProfile({
        like: newLikeList,
      });

      // remove refused candidate
      newAllCandidates.splice(newAllCandidates.length - 1, 1);

      if (newAllCandidates.length === 0) {
        fetchAllProfiles();
      }

      // update allCandidates without refused candidate
      setAllCandidates(newAllCandidates);
    } catch (e) {
      console.log(e);
    }
  }

  async function updateLastCandidate() {
    try {
      setLastCandidate(allCandidates[allCandidates.length - 1].identity.userId);

      appState.setUserProfile({
        lastCandidate: allCandidates[allCandidates.length - 1].identity.userId,
      });

      // set lastCandidate for current user into bdd
      const userProfile = await db
        .collection("users")
        .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
        .get();

      userProfile.forEach(docs => {
        docs.ref.update({
          "match.lastCandidate": allCandidates[allCandidates.length - 1].identity.userId,
        });
      });
    } catch (e) {
      console.log(e);
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
    try {
      let query = [];
      const newAllCandidates = [];

      if (appState.userProfile.lastCandidate) {
        query = await db
          .collection("users")
          .orderBy(new FieldPath("identity", "userId"))
          .startAfter(appState.userProfile.lastCandidate)
          // .where(new FieldPath("identity", "gender"), "==", appState.userProfile.whatIWant.gender)
          // .where(new FieldPath("identity", "sexualOrientation"), "==", appState.userProfile.whatIWant.sexualOrientation)
          // .where(new FieldPath("identity", "city"), "==", appState.userProfile.whatIWant.city)
          .limit(5)
          .get();
      } else {
        query = await db
          .collection("users")
          .orderBy(new FieldPath("identity", "userId"))
          // .where(new FieldPath("identity", "gender"), "==", appState.userProfile.whatIWant.gender)
          // .where(new FieldPath("identity", "sexualOrientation"), "==", appState.userProfile.whatIWant.sexualOrientation)
          // .where(new FieldPath("identity", "city"), "==", appState.userProfile.whatIWant.city)
          .limit(5)
          .get();
      }

      // forEach user find check if current user already refuse or like him and otherwise push him into newAllCandidates
      query.forEach(user => {
        const userData = user.data();

        if (!appState.userProfile.refuse.includes(userData.identity.userId) && !appState.userProfile.like.includes(userData.identity.userId) && appState.userProfile.userId !== userData.identity.userId) {
          newAllCandidates.push(userData);
        }
      });

      if (newAllCandidates.length === 0) {
        // get current user
        const userProfile = await db
          .collection("users")
          .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
          .get();

        // update match refuse list of current user into bdd
        userProfile.forEach(docs => {
          docs.ref.update({
            "match.refuse": [],
            "match.lastCandidate": "",
          });
        });

        // update local refuse list
        appState.setUserProfile({
          refuse: [],
        });

        const query = await db
          .collection("users")
          .orderBy(new FieldPath("identity", "userId"))
          // .where(new FieldPath("identity", "gender"), "==", appState.userProfile.whatIWant.gender)
          // .where(new FieldPath("identity", "sexualOrientation"), "==", appState.userProfile.whatIWant.sexualOrientation)
          // .where(new FieldPath("identity", "city"), "==", appState.userProfile.whatIWant.city)
          .limit(5)
          .get();

        query.forEach(user => {
          const userData = user.data();

          if (!appState.userProfile.like.includes(userData.identity.userId)) {
            newAllCandidates.push(userData);
          }
        });
      }

      setAllCandidates(newAllCandidates.reverse());
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    fetchAllProfiles();
    return () => {
      setAllCandidates([]);
    };
  }, []);

  return (
    <>
      <View style={styles.imageContainer}>
        {allCandidates.length > 0 && (
          <>
            <Image style={styles.image} source={{ uri: allCandidates[allCandidates.length - 1].identity.photos[0] }} />
            <Text style={styles.title}>{allCandidates[0] ? allCandidates[allCandidates.length - 1].identity.displayName : ""}</Text>
            <Button title="Yes" onPress={() => likeCandidate()} />
            <Button title="No" onPress={() => refuseCandidate()} />
          </>
        )}
      </View>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Hello ! Bienvenue dans le Home</Text>
        <Button title="Log out" onPress={logout} />
      </View>
      <View style={styles.containerCenter}>
        <Text style={styles.title}>Go to messaging</Text>
        <Button title="Go to message" onPress={() => navigation.navigate("AllMessage")} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  containerCenter: {
    flex: 2,
    justifyContent: "center",
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
  imageContainer: {
    flex: 3,
    marginHorizontal: 20,
  },
});

// if (action.name === "clean") {
//   return [];
// }

// if (action.name === "init") {
//   return [...action.newValue];
// } else {
//   const newState = state.slice();
//   console.log("start of else function");
//   console.log(newState);
//   setLastCandidate(newState[newState.length - 1].identity.userId);
//   // set lastCandidate into bdd
//   const userProfile = db
//     .collection("users")
//     .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
//     .get();

//   // @TODO use async
//   userProfile
//     .then(users => {
//       users.forEach(docs => {
//         console.log("into then");
//         console.log(newState);
//         docs.ref.update({
//           "match.lastCandidate": newState[newState.length - 1].identity.userId,
//         });
//       });
//       newState.pop();
//     })
//     .catch(error => {
//       console.log(error);
//     });

//   if (newState.length === 0) {
//     fetchAllProfiles();
//   }

//   if (action.name === "refuse") {
//     // add userId to refuse list of currentUser
//     const newRefuseList = appState.userProfile.refuse;
//     newRefuseList.push(state[state.length - 1].identity.userId);
//     appState.setUserProfile({
//       refuse: newRefuseList,
//     });
//     const userProfile = db
//       .collection("users")
//       .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
//       .get();

//     // @TODO use async
//     userProfile
//       .then(users => {
//         users.forEach(docs => {
//           const newRefuseList = docs.data().match.refuse;
//           newRefuseList.push(state[state.length - 1].identity.userId);
//           docs.ref.update({
//             "match.refuse": newRefuseList,
//           });
//         });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }

//   if (action.name === "like") {
//     // if other user already like current user
//     if (state[state.length - 1].match.like.includes(appState.userProfile.userId)) {
//       // add other user into likeReciprocal of current user
//       const newLikeReciprocalList = appState.userProfile.likeReciprocal;
//       newLikeReciprocalList.push(state[state.length - 1].identity.userId);
//       appState.setUserProfile({
//         likeReciprocal: newLikeReciprocalList,
//       });
//       // update current user profile into bdd
//       const currentUserProfile = db
//         .collection("users")
//         .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
//         .get();

//       // @TODO use async
//       currentUserProfile
//         .then(users => {
//           users.forEach(docs => {
//             const newLikeReciprocalList = docs.data().match.likeReciprocal;
//             newLikeReciprocalList.push(state[state.length - 1].identity.userId);
//             docs.ref.update({
//               "match.likeReciprocal": newLikeReciprocalList,
//             });
//           });
//         })
//         .catch(error => {
//           console.log(error);
//         });
//       // remove current user to like list of other user and add it to likeReciprocal too
//       const otherUserProfile = db
//         .collection("users")
//         .where(new FieldPath("identity", "userId"), "==", state[state.length - 1].identity.userId)
//         .get();

//       // @TODO use async
//       otherUserProfile
//         .then(users => {
//           users.forEach(docs => {
//             const newLikeReciprocalList = docs.data().match.likeReciprocal;
//             newLikeReciprocalList.push(appState.userProfile.userId);
//             const newLikeList = docs.data().match.like;
//             newLikeList.splice(newLikeList.indexOf(appState.userProfile.userId), 1);
//             docs.ref.update({
//               "match.likeReciprocal": newLikeReciprocalList,
//               "match.like": newLikeList,
//             });
//           });
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     } else {
//       const newLikeList = appState.userProfile.like;
//       newLikeList.push(state[state.length - 1].identity.userId);
//       appState.setUserProfile({
//         like: newLikeList,
//       });
//       const userProfile = db
//         .collection("users")
//         .where(new FieldPath("identity", "userId"), "==", appState.userProfile.userId)
//         .get();

//       // @TODO use async
//       userProfile
//         .then(users => {
//           users.forEach(docs => {
//             const newLikeList = docs.data().match.like;
//             newLikeList.push(state[state.length - 1].identity.userId);
//             docs.ref.update({
//               "match.like": newLikeList,
//             });
//           });
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     }
//   }

//   return newState;
// }
