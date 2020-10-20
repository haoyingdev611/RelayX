import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Dimensions
} from "react-native";
import I18n from "../src/locales";
import { InputMetaTextInfo } from "../src/components/InputMetaText";
import { IconButton } from "../src/components/IconButton";
import Header from "../src/components/BalanceHeader";
import util from "../utils/util";
import KeyPad from "../src/components/KeyPad";
import { Colors } from "../src/constants";
import FiatButton from "../src/components/FiatButton";
import { Loader } from "../src/components/Loader";
import { useSend } from "../src/send";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { PaymentNameWithLogo } from "../src/components/PaymentNameWithLogo";
import { isInstantExchange, getInstantExchangeId } from "../src/payments";
import { useSelector } from "react-redux";
import { useDidMount } from "../src/hooks/useDidMount";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";

const { width } = Dimensions.get("window");

const InputMode = {
  Currency: 0,
  Satoshi: 1
};

interface OwnProps {}

type Props = OwnProps &
  NavigationProps<{
    paymentId: number;
    amount: number;
    handle: string;
    handleAddress: string;
  }>;

function getVisibleValue(visibleValue: string, inputMode: number) {
  if (visibleValue) {
    if (inputMode === InputMode.Currency) {
      return util.roundCurrency(visibleValue);
    } else {
      if (Number(visibleValue) >= 100000000) {
        return Number(visibleValue) / 100000000;
      } else {
        return util.roundCurrency(visibleValue);
      }
    }
  } else {
    return "0";
  }
}

export default function SendSecondScreen(props: Props) {
  const send = useSend();
  const checkBalanceUpdate = useBalanceUpdate();
  const updateExchangeRates = useUpdateExchangeRates();
  const {
    currencyExchangeRate,
    localSymbolSign,
    balanceSAT,
    node,
    privateKey,
    symbolId,
    symbolName
  } = useSelector(mapStateToProps);

  const [exchangeOutputs, setExchangeOutputs] = useState(
    [] as {
      address: string;
      pct: string;
    }[]
  );
  const [amountSAT, setAmountSAT] = useState(
    Number(props.navigation.state.params.amount) || 0
  );
  const isReadonly = (Number(props.navigation.state.params.amount) || 0) > 0;
  const [amount, setAmount] = useState(
    amountSAT > 0
      ? (amountSAT / Number(currencyExchangeRate) / 100000000).toFixed(2)
      : ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const [exchangePCT, setExchangePCT] = useState(0.003);
  const [inputMode, setInputMode] = useState(InputMode.Currency);
  const [{ visibleValue, infoValue }, setValue] = useState({
    visibleValue: amount,
    infoValue: `${util.roundCurrency(Math.floor(amountSAT))} ${I18n.t(
      "satoshi"
    )}`
  });

  useDidMount(async () => {
    await updateExchangeRates();

    if (isInstantExchange(props.navigation.state.params.paymentId)) {
      const result = await fetch(
        `https://www.relayx.io/api/floatsv/receive/config/${getInstantExchangeId(
          props.navigation.state.params.paymentId
        )}`
      );
      const data = await result.json();
      if (data.code === 0) {
        setExchangeOutputs(data.data);
        setExchangePCT(
          1 -
            data.data.sort(
              (a: { pct: number }, b: { pct: number }) => b.pct - a.pct
            )[0].pct
        );
      }
    }
    setIsLoading(false);
  });

  function onAmountChange(value: string) {
    let amount, amountSAT, visibleValue, infoValue;
    if (inputMode === InputMode.Currency) {
      visibleValue = amount = value;
      amountSAT = Number(value) * Number(currencyExchangeRate) * 100000000;
      infoValue = `${util.roundCurrency(Math.floor(amountSAT))} ${I18n.t(
        "satoshi"
      )}`;
    } else {
      visibleValue = value;
      amountSAT = Number(value);
      amount = Number(value) / Number(currencyExchangeRate) / 100000000.0;
      infoValue = `${localSymbolSign} ${Number(amount).toFixed(2)}`;
    }
    setAmount(amount.toString());
    setAmountSAT(amountSAT);
    setValue({ visibleValue, infoValue });
  }

  function isValid() {
    const handleAddress = props.navigation.state.params.handleAddress;

    if (handleAddress === "") {
      return false;
    }
    if (isNaN(+amount)) {
      return false;
    }

    let amountSAT = Number(amount) * Number(currencyExchangeRate) * 100000000;

    const navigationParams = props.navigation.state.params || {};
    const prefillAmount = navigationParams.amount;
    if (prefillAmount) {
      amountSAT = prefillAmount;
    }

    if (amountSAT === 0) {
      return false;
    }

    return balanceSAT >= amountSAT;
  }

  function getAmounts() {
    let amountSAT = Number(amount) * Number(currencyExchangeRate) * 100000000;
    let amountLocal = Number(amount);

    const navigationParams = props.navigation.state.params || {};
    const prefillAmount = navigationParams.amount;
    if (prefillAmount) {
      amountSAT = prefillAmount;
      amountLocal = prefillAmount / Number(currencyExchangeRate) / 100000000;
    }

    return [amountSAT, amountLocal];
  }

  function handleChangeInputMode() {
    const inputMode2 = (inputMode + 1) % 2;
    setInputMode(inputMode2);
    if (inputMode2 === InputMode.Currency) {
      setValue({
        visibleValue: Number(amount)
          .toFixed(2)
          .toString(),
        infoValue: `${util.roundCurrency(Math.floor(amountSAT))} ${I18n.t(
          "satoshi"
        )}`
      });
    } else {
      setValue({
        visibleValue: Math.floor(amountSAT).toString(),
        infoValue: `${localSymbolSign} ${util.roundCurrency(amount)}`
      });
    }
  }

  async function handleSendBSV() {
    const { navigation } = props;
    const handleAddress = navigation.state.params.handleAddress;
    const sendHandle = navigation.state.params.handle;
    const paymentId = navigation.state.params.paymentId;

    if (!isValid()) {
      return;
    }

    const [amountSAT, amountLocal] = getAmounts();

    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (isInstantExchange(paymentId)) {
        const res = await send(
          exchangeOutputs.map(o => ({
            address: o.address,
            value: +(amountSAT * Number(o.pct)).toFixed()
          })),
          amountSAT,
          privateKey,
          amountLocal,
          {
            payMark:
              paymentId === 10000001
                ? `float:${sendHandle}`
                : `okex:${sendHandle}`,
            symbolId: symbolId,
            localSymbolId: symbolId,
            localSymbolName: symbolName
          },
          node
        );
        await fetch("https://www.relayx.io/api/floatsv/recharge", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            amount: (amountSAT / 100000000).toFixed(8),
            currency: "BSV",
            destination: getInstantExchangeId(paymentId),
            to_address: sendHandle,
            txid: res.hash
          })
        });
      } else {
        await send(
          [{ address: handleAddress, value: Math.round(amountSAT) }],
          Math.round(amountSAT),
          privateKey,
          amountLocal,
          {
            payMark: sendHandle,
            symbolId: symbolId,
            localSymbolId: symbolId,
            localSymbolName: symbolName
          },
          node
        );
      }
      await goSendSuccess(amountLocal, amountSAT);
      Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }

  async function goSendSuccess(amountLocal: number, amountSAT: number) {
    const { navigation } = props;
    const sendHandle = navigation.state.params.handle;
    const handleAddress = navigation.state.params.handleAddress;
    const iconType = sendHandle === handleAddress ? 1 : 2;

    setAmount("");
    checkBalanceUpdate();
    navigation.navigate("sendSuccess", {
      amount: amountLocal,
      amountSAT,
      handle: iconType === 1 ? "" : sendHandle,
      inputMode
    });
  }

  function handleGoBack() {
    const { navigation } = props;
    navigation.goBack();
  }

  const { navigation } = props;
  const sendHandle = navigation.state.params.handle;
  const paymentId = navigation.state.params.paymentId;
  const [amountSAT2] = getAmounts();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <Header headerText={I18n.t("send")} onBackPress={handleGoBack} />
        <View style={{ flex: 1 }}>
          {!isReadonly && (
            <View style={styles.currencyWrapper}>
              <PaymentNameWithLogo
                paymentId={paymentId}
                linkedInfo={sendHandle}
              />
            </View>
          )}
          <View style={styles.coinInputView}>
            {isReadonly && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 36
                }}
              >
                <IconButton
                  size={16}
                  source={require("../icons/switch.png")}
                  onPress={handleChangeInputMode}
                  style={{ marginLeft: 50 }}
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={[styles.unit, { color: "black" }]}>
                    {inputMode === InputMode.Currency ? localSymbolSign : "sat"}
                  </Text>
                  <Text
                    style={[
                      styles.txtBitCoinFill,
                      {
                        fontSize: inputMode === InputMode.Currency ? 50 : 30
                      }
                    ]}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    {util.roundCurrency(visibleValue)}
                  </Text>
                </View>
              </View>
            )}
            {!isReadonly && (
              <View style={styles.bitcoinView}>
                <IconButton
                  size={16}
                  source={require("../icons/switch.png")}
                  onPress={handleChangeInputMode}
                  style={{ marginRight: 250 }}
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute"
                  }}
                >
                  <Text
                    style={[
                      styles.unit,
                      { color: visibleValue ? "black" : Colors.LightGrey }
                    ]}
                  >
                    {inputMode === InputMode.Currency && localSymbolSign}
                    {inputMode !== InputMode.Currency &&
                      Number(visibleValue) >= 100000000 &&
                      "BTC"}
                    {inputMode !== InputMode.Currency &&
                      Number(visibleValue) < 100000000 &&
                      "sat"}
                  </Text>
                  <Text
                    style={
                      visibleValue
                        ? [
                            styles.txtBitCoinFill,
                            {
                              fontSize:
                                inputMode === InputMode.Currency ? 50 : 30,
                              maxWidth:
                                inputMode === InputMode.Currency
                                  ? width - 110
                                  : width - 160
                            }
                          ]
                        : styles.placeholderStyle
                    }
                    ellipsizeMode="tail"
                    numberOfLines={1}
                  >
                    {getVisibleValue(visibleValue, inputMode)}
                  </Text>
                </View>
              </View>
            )}
            <InputMetaTextInfo>{infoValue}</InputMetaTextInfo>
          </View>
          {isReadonly ? (
            <View />
          ) : (
            <KeyPad
              style={{ marginBottom: 40 }}
              value={visibleValue}
              onChange={onAmountChange}
              trippleZero={inputMode === InputMode.Satoshi}
            />
          )}
          {isInstantExchange(paymentId) && (
            <View
              style={{
                backgroundColor: Colors.OrangeYellowWithOpacity(0.1),
                margin: 15,
                padding: 5,
                justifyContent: "center",
                borderRadius: 5
              }}
            >
              <Text
                style={{
                  color: Colors.OrangeYellow,
                  textAlign: "center"
                }}
              >
                {paymentId === 10000001 ? "FloatSV" : "OKEx"} 0-confirm BSV
              </Text>
              <Text
                style={{
                  color: Colors.OrangeYellow,
                  textAlign: "center"
                }}
              >
                Min Deposit {localSymbolSign}
                {(Math.ceil(1 / currencyExchangeRate) / 100)
                  .toFixed(2)
                  .replace(/\.00?$/, "")
                  .replace(/\.(\d)0/, ".$1")}
              </Text>
              <Text
                style={{
                  color: Colors.OrangeYellow,
                  textAlign: "center"
                }}
              >
                Instant Deposit Fee{" "}
                {(exchangePCT * 100)
                  .toFixed(2)
                  .replace(/\.00?$/, "")
                  .replace(/\.(\d)0/, ".$1")}
                %
              </Text>
            </View>
          )}
          <FiatButton
            payable={paymentId === 1}
            amountSAT={
              !isInstantExchange(paymentId)
                ? amountSAT2
                : amountSAT2 > 0.01 * 100000000
                ? amountSAT2
                : 0
            }
            address={props.navigation.state.params.handleAddress}
            sendHandle={props.navigation.state.params.handle}
            title={visibleValue ? I18n.t("send") : I18n.t("typeofamounttosend")}
            enoughBalance={balanceSAT >= amountSAT2}
            onPress={handleSendBSV}
          />

          <Loader visible={isLoading} />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  coinInputView: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  bitcoinView: {
    flexDirection: "row",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 36
  },
  unit: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 1,
    color: "#000"
  },
  txtBitCoinFill: {
    margin: 5,
    color: "#000"
  },
  placeholderStyle: {
    fontSize: 50,
    color: Colors.LightGrey
  },
  currencyWrapper: {
    height: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50
  }
});

const mapStateToProps = (state: AppState) => {
  const { main, currency } = state;
  return {
    balanceSAT: state.wallet.satoshi,
    favoriteList: main.favoriteList || [],
    localSymbolSign: main.localSymbolSign,
    symbolName: main.symbolName,
    symbolId: main.symbolId,
    currencyExchangeRate: currency[main.symbolId] || 1,
    node: state.settingReducer.node,
    privateKey: state.wallet.privateKey!
  };
};
