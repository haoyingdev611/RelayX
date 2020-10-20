import React, { useState } from "react";
import { Text, View, SafeAreaView, StyleSheet, StatusBar } from "react-native";
import I18n from "../src/locales";
import { NavigationProps } from "../src/types";
import { WarnTextView } from "../src/components/WarnTextView";
import AuthorizeBlock from "../src/components/AuthorizeBlock";
import { Button } from "../src/components/Button";
import { Loader } from "../src/components/Loader";
import { useLinkRelayOne } from "../src/relayone";
import { useSelector } from "react-redux";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";
import { useOneSend } from "../src/send";
import { AppState } from "../reducers";
import BalanceHeader from "../src/components/BalanceHeader";
import styled from "styled-components/native";

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: 20px;
`;
const HeaderView = styled.View`
  height: 50px;
  padding: 0 20px;
  flex-direction: row;
`;
const AppImage = styled.Image`
  max-height: 40px;
  max-width: 40px;
`;
const AuthorizeText = styled.Text`
  font-weight: bold;
  font-size: 18px;
  color: black;
`;

interface OwnProps {}

type Props = OwnProps & NavigationProps<{ qrCode: string }>;

export default function RelayOneScreen(props: Props) {
  const [walletValue, setWalletValue] = useState("5.00");
  const linkRelayOne = useLinkRelayOne();
  const currencyExchangeRate = useSelector(
    (state: AppState) => state.currency[state.main.symbolId]!
  );
  const relayOneBalance = useSelector(
    (state: AppState) => state.wallet.relayOneSatoshi
  );
  const mainBalance = useSelector((state: AppState) => state.wallet.satoshi);
  const checkBalanceUpdate = useBalanceUpdate();
  const { wallet, localSymbolSign } = useSelector(mapStateToProps);
  const [isLoading, setIsLoading] = useState(false);

  const oneSend = useOneSend();

  function goBack() {
    props.navigation.navigate("scan");
  }

  function handleDenyPress() {
    goBack();
  }

  async function handleAuthorizePress() {
    const walletSatoshi =
      Number(walletValue) * 100000000 * currencyExchangeRate;
    if (
      walletSatoshi - relayOneBalance > mainBalance ||
      walletSatoshi < relayOneBalance ||
      walletSatoshi == 0
    ) {
      await linkRelayOne(props.navigation.state.params.qrCode!, wallet);
      goBack();
      return;
    }
    await handlePurchase(walletSatoshi);
    await linkRelayOne(props.navigation.state.params.qrCode!, wallet);
    goBack();
  }
  async function handlePurchase(walletSatoshi: number) {
    setIsLoading(true);
    const sendSatoshi = walletSatoshi - relayOneBalance;
    try {
      await oneSend(sendSatoshi);
      await checkBalanceUpdate();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <BalanceHeader onBackPress={goBack} headerText={""} />
      <View style={styles.container}>
        <StatusBar backgroundColor="#FFF" barStyle="light-content" />

        <View style={{ margin: 10 }}>
          <WarnTextView text={I18n.t("relayoneAuthorizeWarnMessage")} />
        </View>
        <View style={styles.center}>
          <HeaderView>
            <View>
              <AppImage
                resizeMode="contain"
                source={require("../icons/methods/relay.png")}
              />
            </View>
            <View style={{ flexDirection: "column", marginLeft: 10 }}>
              <AuthorizeText>Relay One</AuthorizeText>
              <Text>relayx.io</Text>
            </View>
          </HeaderView>
          <AuthorizeBlock
            navigation={props.navigation}
            localSymbolSign={localSymbolSign}
            walletValue={walletValue}
            onChange={setWalletValue}
          />
        </View>
        <View>
          <ButtonContainer>
            <Button
              style={{ flex: 1, margin: 10 }}
              theme="lightPeriwinkle"
              title={I18n.t("deny")}
              onPress={handleDenyPress}
            />
            <Button
              style={{ flex: 1, margin: 10 }}
              theme="clearBlue"
              title={I18n.t("authorize")}
              onPress={handleAuthorizePress}
            />
          </ButtonContainer>
        </View>
      </View>
      <Loader visible={isLoading} />
    </SafeAreaView>
  );
}

//Create Stylesheet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between"
  },

  center: {
    alignItems: "center"
  }
});

const mapStateToProps = (state: AppState) => {
  return {
    wallet: state.wallet,
    localSymbolSign: state.main.localSymbolSign
  };
};
