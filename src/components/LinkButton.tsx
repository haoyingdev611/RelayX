import React from "react";
import PT from "prop-types";
import { Text, TouchableOpacity, ViewPropTypes, ViewStyle } from "react-native";
import { Colors } from "../constants";

interface Props {
  title: string;
  onPress: () => void;
  disabled: boolean;
  style: ViewStyle;
}

const LinkButton = ({ title, onPress, disabled, style }: Props) => {
  const buttonStyle = [
    styles.buttonStyle,
    style,
    {
      opacity: disabled ? 0.5 : 1
    }
  ];

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={disabled}>
      <Text style={styles.textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

LinkButton.propTypes = {
  onPress: PT.func.isRequired,
  title: PT.string,
  disabled: PT.bool,
  style: ViewPropTypes.style
};

LinkButton.defaultProps = {
  title: "",
  disabled: false,
  style: {}
};

const styles = {
  textStyle: {
    fontSize: 16,
    color: Colors.ClearBlue
  },
  buttonStyle: {
    padding: 10,
    justifyContent: "center" as "center",
    alignItems: "center" as "center"
  }
};

export { LinkButton };
