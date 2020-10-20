import React, { useState } from "react";
import { View, SafeAreaView, StyleSheet, Text } from "react-native";
import I18n from "../src/locales";
import util from "../utils/util";
import { Colors } from "../src/constants";
import KeyPad from "../src/components/KeyPad";
import FiatButton from "../src/components/FiatButton";
import { Header } from "../src/components/Header";
import { InputMetaTextInfo } from "../src/components/InputMetaText";
import { Loader } from "../src/components/Loader";
import { useOneSend } from "../src/send";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { useDidMount } from "../src/hooks/useDidMount";
import { useSelector } from "react-redux";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";

interface OwnProps {}

type Props = OwnProps & NavigationProps<void>;

export default function RelayOneScreen(props: Props) {
  const checkBalanceUpdate = useBalanceUpdate();
  const updateExchangeRates = useUpdateExchangeRates();
  const [amount, setAmount] = useState("");
  const oneSend = useOneSend();
  const [isLoading, setIsLoading] = useState(false);
  const {
    currencyExchangeRate,
    balanceSAT,
    relayOnePublicAddress,
    currencySign,
  } = useSelector(mapStateToProps);

  useDidMount(updateExchangeRates);

  const amountLocal = Number(amount) || 0;
  const amountSAT = amountLocal * Number(currencyExchangeRate) * 100000000 || 0;

  function handleBackPress() {
    const { navigation } = props;
    navigation.goBack();
  }

  function handleWithdrawPress() {
    props.navigation.navigate("relayWithdraw");
  }

  function isValid() {
    return amountSAT > 0 && balanceSAT >= amountSAT;
  }

  async function handlePurchase() {
    if (!isValid()) return;
    setIsLoading(true);
    const { orderNumber, hash } = await oneSend(amountSAT);
    await checkBalanceUpdate();
    setIsLoading(false);
    props.navigation.navigate("relayDetail", {
      amountLocal,
      currencySign,
      orderNumber,
      direction: "toRelayOne",
      txHash: hash
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header
          headerText={I18n.t("relayone")}
          rightButtonText={I18n.t("withdraw")}
          onBackPress={handleBackPress}
          onRightPress={handleWithdrawPress}
        />

        <View style={styles.content}>
          <View style={styles.numberView}>
            <Text style={styles.unit}>{currencySign}</Text>
            <Text style={styles.number}>
              {util.roundCurrency(amount) || "0"}
            </Text>
          </View>

          <InputMetaTextInfo>
            {util.assignCurrency(amountSAT, 0)} {I18n.t("satoshi")}
          </InputMetaTextInfo>
        </View>

        <KeyPad
          style={{
            marginTop: 20,
            marginBottom: 20
          }}
          value={amount}
          onChange={setAmount}
        />
        <FiatButton
          title={I18n.t("send")}
          payable
          address={relayOnePublicAddress}
          enoughBalance={balanceSAT >= amountSAT}
          amountSAT={amountSAT}
          onPress={handlePurchase}
        />
        <Loader visible={isLoading} />
      </View>
    </SafeAreaView>
  );
}

//Create Stylesheet
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
  numberView: {
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
    alignItems: "center"
  },
  number: {
    fontSize: 50,
    lineHeight: 60,
    color: Colors.DarkGrey
  },
  unit: {
    fontSize: 22,
    lineHeight: 60,
    marginRight: 6,
    fontWeight: "bold",
    textAlignVertical: "center",
    color: Colors.DarkGrey
  }
});

const mapStateToProps = (state: AppState) => {
  return {
    balanceSAT: state.wallet.satoshi,
    currencySign: state.main.localSymbolSign,
    relayOnePublicAddress: state.wallet.relayOnePublicAddress || "",
    currencyExchangeRate: state.currency[state.main.symbolId]!,
  };
};
