import React, { useState, useEffect, useContext } from "react";
import { StyleSheet } from "react-native";
import Video from "react-native-video";
import Lightbox from "react-native-lightbox";

export function VideoComponent(args) {
  const [open, setOpen] = useState(false);
  console.log(args);
  const { currentMessage } = args;
  return (
    <Lightbox underlayColor="transparent" swipeToDismiss={false} onOpen={() => setOpen(true)} willClose={() => setOpen(false)}>
      <Video controls={open ? true : false} resizeMode="cover" style={open ? styles.videoBig : styles.videoSmall} source={{ uri: currentMessage.video }} paused={true} />
    </Lightbox>
  );
}

const styles = StyleSheet.create({
  videoSmall: {
    width: 150,
    height: 100,
    overflow: "hidden",
    borderRadius: 13,
    margin: 3,
  },
  videoBig: {
    position: "absolute",
    width: "100%",
    height: undefined,
    overflow: "hidden",
    aspectRatio: 3 / 2,
  },
});
