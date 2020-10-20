// @flow
import React from "react";
import PT from "prop-types";
import {
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,  
  ViewStyle
} from "react-native";

interface Props {
  source: ImageSourcePropType;
  size: number;
  disabled: boolean;
  tintColor: string;
  onPress: () => any;
  style?: StyleProp<ViewStyle>
}

const IconButton = ({ source, size, tintColor, disabled, onPress, style }: Props) => {
  const buttonStyle = [
    styles.buttonStyle,
    style,
    {
      opacity: disabled ? 0.5 : 1
    }
  ];

  const iconStyle: ImageStyle = {
    width: size,
    height: size
  };

  if (tintColor) {
    iconStyle.tintColor = tintColor;
  }

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} disabled={disabled}>
      <Image source={source} style={iconStyle} />
    </TouchableOpacity>
  );
};

IconButton.propTypes = {
  disabled: PT.bool,
  size: PT.number,
  // FIXME
  source: PT.any.isRequired,
  tintColor: PT.string,
  onPress: PT.func.isRequired
};

IconButton.defaultProps = {
  size: 20,
  disabled: false,
  tintColor: ""
};

const styles = {
  buttonStyle: {
    padding: 10,
    backgroundColor: "transparent"    
  }
};

export { IconButton };
