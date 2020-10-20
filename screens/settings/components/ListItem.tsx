import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import NextIcon from "./NextIcon";
import { Colors } from "../../../src/constants";

interface Props {
  title: string;
  description: string;
  onPress: () => void;
}

const ListItem = ({ onPress, title, description }: Props) => (
  <TouchableOpacity
    activeOpacity={0.5}
    onPress={onPress}
    style={styles.container}
  >
    <View style={styles.content}>
      <Text style={[styles.backText]}>{title}</Text>
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 17, color: "#D3D7DC", marginRight: 6 }}>
          {description}
        </Text>
        <NextIcon />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 10
  },
  content: {
    paddingHorizontal: 5,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: Colors.PaleGrey,
    borderBottomWidth: 1
  },
  backText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2a2a2e"
  }
});

export { ListItem };
