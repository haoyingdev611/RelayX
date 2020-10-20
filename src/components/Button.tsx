import React from "react";
import PT from "prop-types";
import {
  Text,
  TouchableOpacity,
  ViewPropTypes,
  ViewStyle,
  TextStyle,
  StyleProp
} from "react-native";
import { Colors } from "../constants";

interface Props {
  style: ViewStyle;
  textStyle: StyleProp<TextStyle>;
  onPress: () => any;
  title: string;
  disabled: boolean;
  theme: "clearBlue" | "lightPeriwinkle";
}

const Button = ({
  style,
  textStyle,
  onPress,
  title,
  disabled,
  theme
}: Props) => {
  let backgroundColor = "transparent";
  let textColor = "grey";
  if (theme === "clearBlue") {
    backgroundColor = Colors.ClearBlue;
    textColor = "white";
  } else if (theme === "lightPeriwinkle") {
    backgroundColor = Colors.LightPeriwinkleWithOpacity(0.3);
    textColor = Colors.ClearBlue;
  }

  const buttonStyle = [
    styles.buttonStyle,
    style,
    {
      opacity: disabled ? 0.5 : 1,
      backgroundColor
    }
  ];

  const titleStyle = [styles.textStyle, textStyle, { color: textColor }];

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={disabled}>
      <Text style={titleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

Button.propTypes = {
  style: ViewPropTypes.style,
  // FIXME ?
  textStyle: PT.any,
  onPress: PT.func.isRequired,
  title: PT.string,
  disabled: PT.bool,
  theme: PT.string
};

Button.defaultProps = {
  style: {},
  textStyle: {},
  title: "",
  disabled: false,
  theme: ""
};

const styles = {
  textStyle: {
    fontSize: 19
  },
  buttonStyle: {
    padding: 14,
    backgroundColor: "transparent" as "transparent",
    borderColor: "clear",
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    borderRadius: 5
  }
};

export { Button };
