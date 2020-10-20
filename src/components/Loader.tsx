import React from "react";
import { View, ActivityIndicator } from "react-native";

interface Props {
  visible: boolean;
  sheet?: boolean; // sheet mode == rounded upper corners
  theme?: string;
}

const Loader = ({ visible, sheet, theme }: Props) => {
  const backgroundColor =
    theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.7)";
  if (!visible) return null;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        sheet ? styles.sheet : void 0
      ]}
    >
      <ActivityIndicator size={"large"} />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    position: "absolute" as "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)"
  },

  sheet: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  }
};

export { Loader };
