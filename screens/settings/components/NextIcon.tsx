import React from "react";
import { Image } from "react-native";

export default function NextIcon() {
  return (
    <Image
      resizeMode="contain"
      source={require("../../../icons/next.png")}
      style={{ width: 24, height: 24 }}
    />
  );
}
