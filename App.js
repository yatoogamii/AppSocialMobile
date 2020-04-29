// React import
import React, { useState, useEffect, useReducer, useContext, createContext } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// components
import { SignInScreen } from "./screens/SignInScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CompleteProfileScreen } from "./screens/CompleteProfileScreen";
import { AllMessageScreen } from "./screens/AllMessageScreen";
import { MessageScreen } from "./screens/MessageScreen";

// tools
import { createFakeProfiles } from "./tools/fakeTool.js";

// AsyncStorage
import AsyncStorage from "@react-native-community/async-storage";

const appState = {
  userProfile: {
    email: "",
    displayName: "",
    phone: "",
    photoURL: "",
    userId: "",
    isNewUser: false,
    profileComplete: false,
    lastCandidate: "",
    like: [],
    refuse: [],
    whatIWant: {},
    matches: [],
  },
  notification: false,
  setNotification: action => {},
  setUserProfile: action => {},
  setLogged: action => {},
};

// firebase
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
export const db = firestore();
export const { FieldPath } = firestore;

// AdMob
import admob, { MaxAdContentRating, AdsConsent, AdsConsentStatus } from "@react-native-firebase/admob";

// messaging (notif)
import messaging from "@react-native-firebase/messaging";

// context
export const AppStateContext = createContext(null);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [logged, setLogged] = useReducer(setBasicReducer, false);
  const [userProfile, setUserProfile] = useReducer(userProfileReducer, appState);
  const [notification, setNotification] = useReducer(setBasicReducer, false);

  function userProfileReducer(state, action) {
    return {
      ...state,
      userProfile: {
        ...state.userProfile,
        ...action,
      },
    };
  }

  function setBasicReducer(state, action) {
    return action;
  }

  async function initAdMobConsent() {
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate(["pub-9303553384498866"]);
      console.log(consentInfo);

      if (consentInfo.isRequestLocationInEeaOrUnknown && consentInfo.status === AdsConsentStatus.UNKNOWN) {
        await AdsConsent.showForm({
          privacyPolicy: "https://invertase.io/privacy-policy",
          withPersonalizedAds: true,
          withNonPersonalizedAds: true,
          withAdFree: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  function checkUserAlreadyLogged() {
    auth().onAuthStateChanged(async user => {
      try {
        if (user !== null) {
          await user.reload();

          const userProfile = await db
            .collection("users")
            .where(new FieldPath("identity", "userId"), "==", user.uid)
            .get();

          let matches = [];

          // const matchesQuery = await db
          //   .collection("matches")
          //   .where("participantsId", "array-contains", user.uid)
          //   .get();

          // matchesQuery.forEach(match => {
          //   matches.push(match.data());
          // });

          await db
            .collection("matches")
            .where("participantsId", "array-contains", user.uid)
            .onSnapshot(querySnapshot => {
              matches = [];
              querySnapshot.forEach(match => {
                if (!match.data().viewBy.includes(user.uid)) {
                  console.log("Notification");
                  setNotification(true);
                }
                matches.push(match.data());
              });
              userProfile.forEach(async docs => {
                const data = docs.data();
                const deviceToken = await messaging().getToken();

                if (data.identity.deviceToken !== deviceToken) {
                  docs.ref.update({
                    "identity.deviceToken": deviceToken,
                  });
                }

                setUserProfile({
                  email: user.email,
                  displayName: user.displayName,
                  phone: user.phoneNumber,
                  photoURL: user.photoURL,
                  userId: user.uid,
                  profileComplete: data.permissions.profileComplete,
                  lastCandidate: data.match.lastCandidate,
                  like: data.match.like,
                  refuse: data.match.refuse,
                  whatIWant: data.whatIWant,
                  matches: matches,
                  deviceToken: deviceToken,
                });
              });
            });

          setLogged(true);
        }

        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    });
  }

  useEffect(() => {
    admob()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        initAdMobConsent();
        checkUserAlreadyLogged();
        // createFakeProfiles(20);
      });
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.textLoading}>Chargement de votre session en cours...</Text>
        <ActivityIndicator size="large" color="#1d1d1d" />
      </View>
    );
  }

  return (
    <AppStateContext.Provider
      value={{
        ...userProfile,
        notification,
        setNotification,
        setUserProfile,
        setLogged,
      }}>
      <NavigationContainer>{logged === false ? <LoginStackScreen /> : <HomeTabScreen />}</NavigationContainer>
    </AppStateContext.Provider>
  );
}

const HomeTab = createBottomTabNavigator();

function HomeTabScreen() {
  const appState = useContext(AppStateContext);
  return (
    <HomeTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          console.log(appState);
          let iconName;
          let iconColor;

          iconColor = focused ? "red" : "#1d1d1d";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "AllMessage":
              iconName = "bubbles";
              iconColor = appState.notification === true ? "green" : iconColor;
              break;
          }

          return <Icon name={iconName} color={iconColor} />;
        },
      })}>
      {appState.userProfile.profileComplete === false ? <HomeTab.Screen name="CompleteProfile" component={CompleteProfileScreen} /> : <HomeTab.Screen name="Home" component={HomeScreen} />}
      <HomeTab.Screen name="AllMessage" component={AllMessageScreen} />
      <HomeTab.Screen name="Message" component={MessageScreen} />
    </HomeTab.Navigator>
  );
}

const LoginStack = createStackNavigator();

function LoginStackScreen() {
  return (
    <LoginStack.Navigator>
      <LoginStack.Screen name="SignIn">{props => <SignInScreen {...props} />}</LoginStack.Screen>
      <LoginStack.Screen name="SignUp">{props => <SignUpScreen {...props} />}</LoginStack.Screen>
    </LoginStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  textLoading: {
    textAlign: "center",
    marginBottom: 40,
  },
});
