import React, { useState } from "react";
import { Text, View, StyleSheet, SafeAreaView } from "react-native";
import { Colors } from "../src/constants";
import I18n from "../src/locales";
import KeyPad from "../src/components/KeyPad";
import { Header } from "../src/components/Header";
import {
  InputMetaTextInfo,
  InputMetaTextWarn
} from "../src/components/InputMetaText";
import { BottomPrimaryButton } from "../src/components/PrimaryButton";
import { Loader } from "../src/components/Loader";
import { sendRaw } from "../src/send";
import { NavigationProps } from "../src/types";
import { State } from "../reducers";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { getRelayOneBalanceShow } from "../src/selectors/walletSelectors";
import { useDidMount } from "../src/hooks/useDidMount";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";
import { useSelector } from "react-redux";

interface OwnProps {}

type Props = OwnProps & NavigationProps<void>;

export default function RelayWithdrawScreen(props: Props) {
  const checkBalanceUpdate = useBalanceUpdate();
  const updateExchangeRates = useUpdateExchangeRates();

  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const {
    currencyExchangeRate,
    node,
    publicAddress,
    relayOnePrivateKey,
    localSymbolSign,
    relayOneSatoshi,
    relayOneBalance
  } = useSelector(mapStateToProps);

  const amountSAT =
    Number(amount) * Number(currencyExchangeRate) * 100000000 || 0;
  const amountLocal = Number(amount) || 0;

  useDidMount(async () => {
    await updateExchangeRates();
    setIsLoading(false);
  });

  async function onWithdraw() {
    setIsLoading(true);
    const txHash = await sendRaw(
      [{ address: publicAddress, value: Math.round(amountSAT) }],
      relayOnePrivateKey,
      node
    );
    await checkBalanceUpdate();
    setIsLoading(false);
    props.navigation.navigate("relayDetail", {
      amountLocal,
      currencySign: localSymbolSign,
      txHash,
      direction: "fromRelayOne"
    });
  }

  function isValid() {
    if (amountSAT === 0 || amountSAT > relayOneSatoshi) {
      return false;
    }

    return true;
  }

  function handleBackPress() {
    const { navigation } = props;
    navigation.goBack();
  }

  const isBalanceStable = amountSAT <= relayOneSatoshi;
  let textColor = Colors.DarkGrey;
  if (!amount) {
    textColor = Colors.LightGrey;
  } else if (!isBalanceStable) {
    textColor = Colors.OrangeYellow;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header headerText={I18n.t("withdraw")} onBackPress={handleBackPress} />

        <View style={styles.content}>
          <View style={styles.bitcoinView}>
            <Text style={[styles.unit, { color: textColor }]}>
              {localSymbolSign}
            </Text>
            <Text
              style={
                amount
                  ? [styles.txtBitCoinFill, { color: textColor }]
                  : [styles.placeholderStyle, { color: textColor }]
              }
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {amount ? amount : ` ${I18n.t("amount")}`}
            </Text>
          </View>

          {isBalanceStable ? (
            <InputMetaTextInfo>
              {I18n.t("balance")} {localSymbolSign} {relayOneBalance}
            </InputMetaTextInfo>
          ) : (
            <InputMetaTextWarn>{I18n.t("lowBalanceMessage")}</InputMetaTextWarn>
          )}
        </View>

        <KeyPad
          value={amount}
          onChange={setAmount}
          style={{
            marginTop: 20,
            marginBottom: 20
          }}
        />

        <BottomPrimaryButton
          onPress={() => {
            isValid() && onWithdraw();
          }}
          disabled={!isValid()}
          title={I18n.t("withdraw")}
        />

        <Loader visible={isLoading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15
  },
  bitcoinView: {
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  unit: {
    fontSize: 22,
    lineHeight: 60,
    marginRight: 6,
    fontWeight: "bold",
    textAlignVertical: "center"
  },
  txtBitCoinFill: {
    fontSize: 50,
    lineHeight: 60
  },
  placeholderStyle: {
    fontSize: 16,
    lineHeight: 60,
    color: Colors.LightGrey
  }
});

const mapStateToProps = (state: State) => {
  const { main, wallet, currency } = state;
  const { localSymbolSign } = main;
  return {
    localSymbolSign,
    relayOneSatoshi: wallet.relayOneSatoshi,
    currencyExchangeRate: currency[main.symbolId] || 1,
    relayOneBalance: getRelayOneBalanceShow(state),
    relayOnePrivateKey: wallet.relayOnePrivateKey || "",
    publicAddress: wallet.publicAddress!,
    node: state.settingReducer.node
  };
};
