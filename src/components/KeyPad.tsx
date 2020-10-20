import React, { Component } from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Button } from "./Button";
import { Colors } from "../constants";

interface Props {
  fontWeight?: "bold";
  style?: ViewStyle;
  keyPadInnerViewStyle?: ViewStyle;
  btnViewStyle?: ViewStyle;
  buttonStyle?: TextStyle;

  hideDot?: boolean;
  trippleZero?: boolean;

  onClick: (number: string) => any;
  onBackSpace: () => any;
}

export class KeyPad extends Component<Props> {
  render() {
    const { fontWeight } = this.props;
    const buttonStyle = fontWeight
      ? [styles.btnKey, { fontWeight }, this.props.buttonStyle]
      : [styles.btnKey, this.props.buttonStyle];
    return (
      <View style={[styles.keyPadView, this.props.style]}>
        <View style={[styles.keyPadInnerView, this.props.keyPadInnerViewStyle]}>
          <View style={[styles.btnView, this.props.btnViewStyle]}>
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="1"
              onPress={() => {
                this.props.onClick("1");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="2"
              onPress={() => {
                this.props.onClick("2");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="3"
              onPress={() => {
                this.props.onClick("3");
              }}
            />
          </View>

          <View style={[styles.btnView, this.props.btnViewStyle]}>
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="4"
              onPress={() => {
                this.props.onClick("4");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="5"
              onPress={() => {
                this.props.onClick("5");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="6"
              onPress={() => {
                this.props.onClick("6");
              }}
            />
          </View>

          <View style={[styles.btnView, this.props.btnViewStyle]}>
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="7"
              onPress={() => {
                this.props.onClick("7");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="8"
              onPress={() => {
                this.props.onClick("8");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="9"
              onPress={() => {
                this.props.onClick("9");
              }}
            />
          </View>

          <View style={[styles.btnView, this.props.btnViewStyle]}>
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              disabled={this.props.hideDot}
              title={
                this.props.hideDot ? "" : this.props.trippleZero ? "000" : "."
              }
              onPress={() => {
                this.props.onClick(this.props.trippleZero ? "000" : ".");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="0"
              onPress={() => {
                this.props.onClick("0");
              }}
            />
            <Button
              style={{ flex: 1, padding: 0 }}
              textStyle={buttonStyle}
              title="⌫"
              onPress={() => {
                this.props.onBackSpace();
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

interface ControlledProps extends Omit<Props, "onClick" | "onBackSpace"> {
  value: string;
  allowStartWithZero?: boolean;
  onChange: (amount: string) => any;
}

export default class KeyPadControlled extends Component<ControlledProps> {
  // 输入amount
  handledClick = (digit: string) => {
    let amount = this.props.value;
    if (this.props.allowStartWithZero) {
      amount = amount + digit;
    } else {
      if (!amount || amount === "0") {
        amount = digit === "000" ? "0" : digit;
      } else {
        amount = amount + digit;
      }
    }
    if (amount === ".") {
      amount = "0" + digit;
    }
    if (amount.split(".").length > 2) {
      amount = amount.slice(0, amount.length - 1);
    }
    this.props.onChange(amount);
  };

  // 删除amount
  pressBackSpace = () => {
    let amount = this.props.value;
    amount = amount.slice(0, amount.length - 1);
    this.props.onChange(amount);
  };

  render() {
    return (
      <KeyPad
        onClick={this.handledClick}
        onBackSpace={this.pressBackSpace}
        {...this.props}
      />
    );
  }
}

const styles = StyleSheet.create({
  keyPadView: {
    backgroundColor: "#fff",
    height: 240,
    marginBottom: 70
  },
  keyPadInnerView: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 40,
    marginRight: 40
  },
  btnView: {
    flex: 1,
    flexDirection: "row" as "row",
    backgroundColor: "#fff"
  },
  btnKey: {
    fontSize: 35,
    color: Colors.Slate
  }
});
