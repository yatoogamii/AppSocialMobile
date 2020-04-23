// React
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from "react-native";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { db } from "../App.js";

export function AllMessageScreen({ navigation }) {
  const appState = useContext(AppStateContext);

  return (
    <View style={styles.containerCenter}>
      <FlatList data={appState.userProfile.matches} renderItem={({ item }) => <Match match={item} navigation={navigation} />} keyExtractor={(item, index) => index.toString()} />
    </View>
  );
}

function Match({ match, navigation }) {
  const appState = useContext(AppStateContext);
  const candidateProfile = match.participantsProfile.filter(participant => {
    return participant.identity.userId !== appState.userProfile.userId;
  });

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Message", { participantsId: match.participantsId })}>
      <View>
        <Image style={styles.image} source={{ uri: candidateProfile[0].identity.photos[0] }} />
        <Text style={styles.text}>{candidateProfile[0].identity.displayName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    marginBottom: 5,
    textAlign: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: 100,
  },
});
