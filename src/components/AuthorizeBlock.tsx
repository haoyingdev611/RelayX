import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import I18n from "../locales";
import { NavigationProps } from "../types";

import styled from "styled-components/native";
const AuthorizeText = styled.Text`
  font-weight: bold;
  font-size: 18px;
  color: black;
`;
const InputArea = styled.View`
  height: 100px;
  margin-vertical: 20px;
  justify-content: center;
  align-items: center;
`;
const RoundImage = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  overflow: hidden;
`;
const AuthInput = styled.TextInput`
  font-size: 35px;
  text-align: center;
  font-weight: bold;
`;
const LocalSymbolText = styled.Text`
  color: black;
  font-weight: bold;
  font-size: 35px;
  text-align-vertical: center;
`;
const WalletWithSymbol = styled.View`
  margin-horizontal: 30px;
  flex-direction: row;
  width: 200px;
  justify-content: center;
`;

interface Props extends NavigationProps<{ qrCode: string }> {
  localSymbolSign: string;
  walletValue: string;
  onChange: (val: string) => void;
}

export default function AuthorizeBlock(props: Props) {
  const { walletValue, onChange } = props;
  // const onWalletValueChange = (changedValue: string) => {
  //     setWalletValue(changedValue);
  // }
  const onAddPress = () => {
    onChange((+walletValue + 1).toFixed(2));
  };
  const onMinusPress = () => {
    if (Number(walletValue) < 1) return;
    onChange((+walletValue - 1).toFixed(2));
  };
  const onLostFocus = () => {
    if (walletValue === "") onChange("0");
  };
  return (
    <InputArea>
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <AuthorizeText>{I18n.t("walletAccess")}</AuthorizeText>
        <Text>{I18n.t("setLimitFunds")}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={{ justifyContent: "center" }}
          onPress={onMinusPress}
          activeOpacity={0.5}
        >
          <RoundImage
            resizeMode="contain"
            source={require("../../icons/minus.png")}
          />
        </TouchableOpacity>
        <WalletWithSymbol>
          <LocalSymbolText>{props.localSymbolSign}</LocalSymbolText>
          <AuthInput
            keyboardType={"numeric"}
            value={walletValue}
            onChangeText={(changedValue: string) => {
              onChange(changedValue);
            }}
            onBlur={onLostFocus}
          />
        </WalletWithSymbol>
        <TouchableOpacity
          style={{ justifyContent: "center" }}
          onPress={onAddPress}
          activeOpacity={0.5}
        >
          <RoundImage
            resizeMode="contain"
            source={require("../../icons/gray_add.png")}
          />
        </TouchableOpacity>
      </View>
    </InputArea>
  );
}
