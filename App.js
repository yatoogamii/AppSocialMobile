// React import
import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  createContext,
} from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// components
import { SignInScreen } from "./screens/SignInScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CompleteProfileScreen } from "./screens/CompleteProfileScreen";

// tools
import { createFakeProfiles } from "./tools/fakeTool.js";

const appState = {
  userProfile: {
    email: "",
    displayName: "",
    phone: "",
    photoURL: "",
    userId: "",
    isNewUser: false,
    profileComplete: false,
  },
  setUserProfile: action => {},
  setLogged: action => {},
};

// firebase
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
export const db = firestore();
const { FieldPath } = firestore;

// context
export const AppStateContext = createContext(null);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [logged, setLogged] = useReducer(setLoggedReducer, false);
  const [userProfile, setUserProfile] = useReducer(
    userProfileReducer,
    appState,
  );

  function userProfileReducer(state, action) {
    return {
      ...state,
      userProfile: {
        ...state.userProfile,
        ...action,
      },
    };
  }

  function setLoggedReducer(state, action) {
    return action;
  }

  function checkUserAlreadyLogged() {
    auth().onAuthStateChanged(async user => {
      try {
        if (user !== null) {
          await user.reload();

          const response = await db
            .collection("users")
            .where(new FieldPath("identity", "userId"), "==", user.uid)
            .get();

          response.forEach(async docs => {
            console.log(docs.data());
            setUserProfile({
              email: user.email,
              displayName: user.displayName,
              phone: user.phoneNumber,
              photoURL: user.photoURL,
              userId: user.uid,
              profileComplete: docs.data().permissions.profileComplete,
            });
          });

          setLogged(true);
        }

        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    });

    setTimeout(() => {}, 1000);
  }

  useEffect(() => {
    checkUserAlreadyLogged();
    // createFakeProfiles(2);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.textLoading}>
          Chargement de votre session en cours...
        </Text>
        <ActivityIndicator size="large" color="#1d1d1d" />
      </View>
    );
  }

  return (
    <AppStateContext.Provider
      value={{
        ...userProfile,
        setUserProfile,
        setLogged: setLogged,
      }}>
      <NavigationContainer>
        {logged === false ? <LoginStackScreen /> : <HomeStackScreen />}
      </NavigationContainer>
    </AppStateContext.Provider>
  );
}

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  const appState = useContext(AppStateContext);
  return (
    <HomeStack.Navigator>
      {appState.userProfile.profileComplete === false ? (
        <HomeStack.Screen name="CompleteProfile">
          {props => <CompleteProfileScreen />}
        </HomeStack.Screen>
      ) : (
        <HomeStack.Screen name="Home">
          {props => <HomeScreen {...props} />}
        </HomeStack.Screen>
      )}
    </HomeStack.Navigator>
  );
}

const LoginStack = createStackNavigator();

function LoginStackScreen() {
  return (
    <LoginStack.Navigator>
      <LoginStack.Screen name="SignIn">
        {props => <SignInScreen {...props} />}
      </LoginStack.Screen>
      <LoginStack.Screen name="SignUp">
        {props => <SignUpScreen {...props} />}
      </LoginStack.Screen>
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
