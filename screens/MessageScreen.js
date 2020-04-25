// @TODO create directory for photo into each conversation (folder with id of conversation for better filter) (medium)
// @TODO dismss keyboard after send (fast)
// @TODO integrate audio (long)
// React
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, TextInput, View, Image, FlatList, TouchableOpacity } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { AppStateContext } from "../App";
import ImagePicker from "react-native-image-picker";
import storage from "@react-native-firebase/storage";
import faker from "faker";

// Components
import { VideoComponent } from "./chatComponents/VideoComponent";
import { ImageComponent } from "./chatComponents/ImageComponent";

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

      newMessage.createdAt = Date.now();
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

  function openImageActions() {
    const options = {
      noData: true,
    };

    try {
      ImagePicker.launchImageLibrary(options, async response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else if (response.customButton) {
          console.log("User tapped custom button: ", response.customButton);
        } else {
          const { uri, fileName, type } = response;
          const imageRef = storage().ref(fileName);
          const imageRefResponse = await imageRef.putFile(uri);

          const newMessage = {
            _id: faker.random.uuid(),
            createdAt: Date.now(),
            user: {
              _id: appState.userProfile.userId,
              avatar: currentUser.identity.photos[0],
              name: currentUser.identity.displayName,
            },
          };

          if (type.includes("image")) {
            newMessage.image = await imageRef.getDownloadURL();
          }
          if (type.includes("video")) {
            newMessage.video = await imageRef.getDownloadURL();
          }

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
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  function ChatActions() {
    return (
      <TouchableOpacity onPress={() => openImageActions()}>
        <View style={{ flex: 0, alignSelf: "center" }}>
          <Text>Photos</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return <GiftedChat messages={Array.from(currentMatch[0].messages).reverse()} lightboxProps={{ swipeToDismiss: false }} springConfig={{ overshootClamping: true }} renderActions={() => ChatActions()} onSend={message => sendMessage(message)} user={{ _id: appState.userProfile.userId }} alwaysShowSend={true} renderMessageVideo={args => <VideoComponent {...args} />} renderMessageImage={args => <ImageComponent {...args} />} />;
}
