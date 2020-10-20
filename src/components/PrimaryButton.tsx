import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants";

type Props = {
  title: string;
  color?: "blue" | "green";
  onPress: () => any;
  disabled?: boolean;
  colorReceive?: boolean;
};

export function PrimaryButton({
  onPress,
  title,
  disabled,
  color,
  colorReceive
}: Props) {
  return (
    <TouchableOpacity
      style={
        disabled
          ? styles.btnSend
          : [
              styles.btnSendFill,
              color === "green"
                ? { backgroundColor: Colors.FrogGreen }
                : void 0,
              colorReceive ? styles.btnBackground : void 0
            ]
      }
      activeOpacity={0.5}
      disabled={disabled}
      onPress={disabled ? () => {} : onPress}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 19,
          color: colorReceive ? Colors.ClearBlue : "#fff"
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function BottomPrimaryButton(props: Props) {
  return (
    <View style={{ marginBottom: 20 }}>
      <PrimaryButton {...props} />
    </View>
  );
}

const styles = {
  btnSendFill: {
    backgroundColor: Colors.ClearBlue, // "rgb(38,105,255)",
    justifyContent: "center" as "center",
    borderRadius: 5,
    height: 50,
    marginHorizontal: 15
  },
  btnSend: {
    backgroundColor: Colors.LightPeriwinkle, // "rgb(204,220,255)",
    justifyContent: "center" as "center",
    borderRadius: 5,
    height: 50,
    marginHorizontal: 15
  },
  btnBackground: {
    backgroundColor: "rgba(204, 220, 255, 0.3)"
  }
};
