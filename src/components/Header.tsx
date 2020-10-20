import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextStyle,
  ImageSourcePropType,
  StyleSheet
} from "react-native";

import { Colors } from "../constants";

const backIcon = require("../../icons/back-left.png");

export interface Props {
  headerText: string | React.ReactElement;
  headerIcon?: ImageSourcePropType;
  leftIcon?: number;
  rightButtonText?: string;
  textStyle?: TextStyle;
  boldTitle?: boolean;
  hideBack?: boolean;
  theme?: "light";

  onTitlePress?: () => any;
  onBackPress: () => any;
  onRightPress?: () => any;
}

const Header = (props: Props) => {
  const applyTextStyle: TextStyle = {
    ...styles.textStyle
  };

  const applyRightButtonTitle = {
    ...styles.rightButtonTextStyle,
    ...props.textStyle
  };

  const backIconStyle: any = {
    tintColor: Colors.ClearBlue
  };

  if (props.boldTitle) {
    applyTextStyle.fontWeight = "bold";
  }

  if (props.theme === "light") {
    backIconStyle.tintColor = "white";
    applyTextStyle.color = "white";
    applyRightButtonTitle.color = "white";
  }

  if (props.leftIcon) {
    backIconStyle.width = 22;
    backIconStyle.height = 22;
  }

  return (
    <View style={[styles.viewStyle]}>
      <View style={styles.contentStyle}>
        {props.headerIcon && (
          <Image source={props.headerIcon} style={[styles.iconStyle]} />
        )}
        {React.isValidElement(props.headerText) ? (
          props.headerText
        ) : (
          <Text style={applyTextStyle} onPress={props.onTitlePress}>
            {props.headerText}
          </Text>
        )}
      </View>

      {!props.hideBack ? (
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={props.onBackPress}
        >
          <Image
            resizeMode={"contain"}
            source={props.leftIcon ? props.leftIcon : backIcon}
            style={backIconStyle}
          />
        </TouchableOpacity>
      ) : (
        <View />
      )}

      {props.rightButtonText && (
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={props.onRightPress}
        >
          <Text style={applyRightButtonTitle}>{props.rightButtonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50
  },
  contentStyle: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  textStyle: {
    fontSize: 20
  },
  iconStyle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10
  },
  buttonStyle: {
    height: 50,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  rightButtonTextStyle: {
    color: Colors.ClearBlue,
    fontSize: 18
  }
});

export { Header };
