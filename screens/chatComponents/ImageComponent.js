import React, { useState, useEffect, useContext } from "react";
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import Lightbox from "react-native-lightbox";

export function ImageComponent(args) {
  const [open, setOpen] = useState(false);
  const { currentMessage } = args;
  return (
    <Lightbox underlayColor="transparent" swipeToDismiss={false} onOpen={() => setOpen(true)} willClose={() => setOpen(false)}>
      <FastImage style={open ? styles.imageBig : styles.imageSmall} source={{ uri: currentMessage.image, priority: FastImage.priority.high }} />
    </Lightbox>
  );
}

const styles = StyleSheet.create({
  imageSmall: {
    width: 150,
    height: 100,
    overflow: "hidden",
    borderRadius: 13,
    margin: 3,
  },
  imageBig: {
    position: "absolute",
    width: "100%",
    height: undefined,
    overflow: "hidden",
    aspectRatio: 3 / 2,
  },
});
