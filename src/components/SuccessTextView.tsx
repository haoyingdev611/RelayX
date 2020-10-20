// Common input warning text
import React, { Component } from "react";
import { Text, Animated, Image, TextStyle } from "react-native";
import delay from "lodash/delay";
import { Colors } from "../constants";

const checkIcon = require("../../icons/checkCircle.png");

interface Props {
  text: string;
  style?: TextStyle;
  isFadeOut: boolean;
}

export default class SuccesTextView extends Component<Props> {
  state = {
    fadeAnim: new Animated.Value(1)
  };

  componentDidMount() {
    if (this.props.isFadeOut) {
      delay(this.fadeOut, 3000);
    }
  }

  fadeOut = () => {
    Animated.timing(this.state.fadeAnim, {
      toValue: 0,
      duration: 2000
    }).start();
  };

  render() {
    const { fadeAnim } = this.state;
    const { style, text } = this.props;
    return (
      <Animated.View style={[styles.containerStyle, { opacity: fadeAnim }]}>
        <Image source={checkIcon} />
        <Text style={[styles.textStyle, style]}>{text}</Text>
      </Animated.View>
    );
  }
}

const styles = {
  containerStyle: {
    padding: 7,
    backgroundColor: Colors.FrogGreen,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  textStyle: {
    marginLeft: 10,
    fontSize: 16,
    color: "white",
    textAlign: "center" as "center"
  }
};
