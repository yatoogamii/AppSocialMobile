// React
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, TextInput, View, Image, FlatList } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { AppStateContext } from "../App";

// firebase
import auth from "@react-native-firebase/auth";
import { db } from "../App.js";

export function MessageScreen({ route, navigation }) {
  const appState = useContext(AppStateContext);
  const { participantsId } = route.params;
  const matches = Array.from(appState.userProfile.matches);

  const currentMatch = matches.filter(match => {
    return match.participantsId.includes(participantsId[0]) && match.participantsId.includes(participantsId[1]);
  });

  const currentUser = currentMatch[0].participantsProfile.filter(user => {
    return user.identity.userId === appState.userProfile.userId;
  })[0];

  const candidate = currentMatch[0].participantsProfile.filter(user => {
    return user.identity.userId !== appState.userProfile.userId;
  })[0];

  async function sendMessage(message) {
    try {
      const newMessage = message[0];

      newMessage.user.avatar = currentUser.identity.photos[0];
      newMessage.user.name = currentUser.identity.displayName;

      const matches = await db
        .collection("matches")
        .where("participantsId", "==", participantsId)
        .get();

      matches.forEach(match => {
        const { messages } = match.data();

        messages.push(newMessage);

        match.ref.update({
          messages: messages,
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  return <GiftedChat messages={currentMatch[0].messages.reverse()} onSend={message => sendMessage(message)} user={{ _id: appState.userProfile.userId }} alwaysShowSend={true} />;
}
