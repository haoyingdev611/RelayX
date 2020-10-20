// Common input warning text
import React from "react";
import PT from "prop-types";
import { View, Text, TextStyle } from "react-native";
import { Colors } from "../constants";

interface Props {
  style: TextStyle;
  text: string;
}

const WarnTextView = ({ style, text }: Props) => (
  <View style={styles.containerStyle}>
    <Text style={[styles.textStyle, style]}>{text}</Text>
  </View>
);

WarnTextView.propTypes = {
  // FIMXE
  style: PT.any,
  text: PT.string
};

WarnTextView.defaultProps = {
  style: {},
  text: ""
};

const styles = {
  containerStyle: {
    padding: 7,
    backgroundColor: Colors.OrangeYellowWithOpacity(0.1),
    borderRadius: 5
  },
  textStyle: {
    color: Colors.OrangeYellow,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center" as "center"
  }
};

export { WarnTextView };
