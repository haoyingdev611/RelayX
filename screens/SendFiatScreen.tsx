import React, { useState } from "react";
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";

import I18n from "../src/locales";
import { datasend, DatapayOptions } from "../src/datapay";
import util from "../utils/util";
import { Colors } from "../src/constants";
import KeyPad from "../src/components/KeyPad";
import FiatFiatButton from "../src/components/FiatFiatButton";
import { Loader } from "../src/components/Loader";
import Header from "../src/components/BalanceHeader";

import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { PaymentOrdersConfig, useApi } from "../src/api";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { getBalanceShow } from "../src/selectors/walletSelectors";
import { getPaymentById } from "../src/selectors/paymentSelectors";
import { PaymentNameWithLogo } from "../src/components/PaymentNameWithLogo";
import { useDidMount } from "../src/hooks/useDidMount";
import { useSelector } from "react-redux";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";

type OwnProps = NavigationProps<{
  paymentId: number;
  linkedInfo: string;
  amountInFiat?: number;
}>;

type Props = OwnProps;

export default function SendFiatScreen(props: Props) {
  const api = useApi();
  const updateExchangeRates = useUpdateExchangeRates();
  const checkBalanceUpdate = useBalanceUpdate();
  const {
    currencyExchangeRatePay,
    currencyExchangeRate,
    payment,
    balanceSAT,
    node,
    privateKey,
    localSymbolSign
  } = useSelector((state: AppState) => {
    const { main, currency } = state;
    const payment = getPaymentById(
      state,
      props.navigation.state.params.paymentId
    );
    return {
      payment,
      balanceSAT: state.wallet.satoshi,
      balanceShow: getBalanceShow(state),
      currencyExchangeRate: currency[main.symbolId] || 1,
      currencyExchangeRatePay: currency[payment.symbolId] || 1,
      localSymbolSign: main.localSymbolSign,
      node: state.settingReducer.node,
      privateKey: state.wallet.privateKey!
    };
  });
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(
    "" + (props.navigation.state.params.amountInFiat || "")
  );
  const [orderInit, setOrderInit] = useState({
    feePre: 2,
    feeType: 0,
    minAmount: 1,
    maxAmount: 500,
    minFeePre: -100,
    maxFeePre: 100,
    relayFeePre: 20
  } as PaymentOrdersConfig);

  useDidMount(async () => {
    try {
      const [orderInit] = await Promise.all([
        api.initSendOrder(payment.paymentId),
        updateExchangeRates()
      ]);
      setOrderInit(orderInit);
      setLoading(false);
    } catch {
      setLoading(false);
      Alert.alert("RelayX", I18n.t("fiatScreenErrorMessage"), [
        {
          text: I18n.t("ok"),
          onPress: () => props.navigation.navigate("scan")
        }
      ]);
    }
  });

  async function handleConfirmBSV() {
    if (isNaN(+amount)) {
      return;
    }

    const numAmount = Number(amount);

    if (numAmount === 0) {
      return;
    }

    const amountSAT =
      numAmount *
      (1 - orderInit.feePre / 100) *
      Number(currencyExchangeRatePay) *
      100000000;

    const { maxAmount, minAmount } = orderInit;
    if (numAmount < minAmount) {
      util.showAlert(
        I18n.t("withdrawMinAmountWarning", {
          linkedSign: payment.sign,
          minAmount
        })
      );
      return;
    }

    if (numAmount > maxAmount) {
      util.showAlert(
        I18n.t("withdrawMaxAmountWarning", {
          linkedSign: payment.sign,
          maxAmount
        })
      );
      return;
    }

    if (amountSAT > balanceSAT) {
      util.showAlert(I18n.t("lowBalanceMessage"));
      return;
    }

    const newAmount = Number(Math.ceil(amountSAT));

    try {
      // 微信 支付宝 交易
      // 阻止多次请求
      if (loading) {
        return;
      }
      setLoading(true);

      const addressRes = await api.earnGetAddress(1);

      const config: DatapayOptions = {
        data: [
          "1HyHXtYWyGePrHVisnNdS931Vt6CqouUyZ",
          "relayx.io",
          "",
          "0",
          JSON.stringify({
            channel: payment.paymentId,
            amount: numAmount,
            currency: payment.symbolName,
            symbol: payment.sign
          })
        ],
        pay: {
          key: privateKey,
          rpc: node,
          to: [
            {
              address: addressRes.data.address,
              value: Math.ceil(Number(amountSAT))
            }
          ]
        }
      };

      const hash = await datasend(config);
      const paramsTwo = {
        bsvAmount: Number(newAmount),
        jsonInfo: props.navigation.state.params.linkedInfo,
        payModeId: payment.paymentId,
        orderNumber: addressRes.data.orderNumber,
        walletRate: currencyExchangeRatePay!,
        walletSendAmount: numAmount,
        walletSymbolId: payment.symbolId,
        walletSymbolName: payment.symbolName,
        walletSymbolSign: payment.sign,
        localFeePer: orderInit.feePre,
        feeType: orderInit.feeType,
        relayFeePer: orderInit.relayFeePre,
        txid: hash
      };
      const orderRes = await api.createSendOrder(paramsTwo);
      const { serialNumber } = orderRes;
      setAmount("");
      Promise.all([checkBalanceUpdate(), updateExchangeRates()]);
      props.navigation.navigate("transactionDetail", {
        orderId: serialNumber,
        tranType: 1,
        autoClose: true
      });
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  function renderAmountInfo() {
    const numAmount = Number(amount);
    const amountShow =
      (numAmount * Number(currencyExchangeRatePay)) /
      Number(currencyExchangeRate);
    const { minAmount, maxAmount } = orderInit;
    if (amount.length > 0) {
      let validAmount = true;
      let infoText =
        currencyExchangeRate !== currencyExchangeRatePay
          ? `${localSymbolSign} ${amountShow.toFixed(2)}`
          : "";
      if (numAmount < minAmount) {
        validAmount = false;
        infoText = I18n.t("amountLowMessage");
      } else if (+amount > maxAmount) {
        validAmount = false;
        infoText = I18n.t("amountHighMessage");
      }
      const infoTextStyle = validAmount
        ? styles.lblAmountInfoFee
        : styles.lblAmountInfoWarning;

      return (
        <View>
          <View style={styles.bitcoinView}>
            <Text
              style={[
                styles.unit,
                { color: amount ? "black" : Colors.LightGrey }
              ]}
            >
              {payment.sign}
            </Text>
            <Text
              style={amount ? styles.txtBitCoinFill : styles.placeholderStyle}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {amount ? amount : "0"}
            </Text>
          </View>
          <Text style={infoTextStyle}>{infoText}</Text>
        </View>
      );
    } else {
      return (
        <View>
          <View style={styles.bitcoinView}>
            <Text
              style={[
                styles.unit,
                { color: amount ? "black" : Colors.LightGrey }
              ]}
            >
              {payment.sign}
            </Text>
            <Text
              style={amount ? styles.txtBitCoinFill : styles.placeholderStyle}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {amount ? amount : "0"}
            </Text>
          </View>
          {!loading && (
            <Text style={styles.lblAmountInfoFee}>
              {payment.sign} {minAmount.toFixed(6)} ~ {payment.sign}{" "}
              {maxAmount.toFixed(6)}
            </Text>
          )}
        </View>
      );
    }
  }

  const { navigation } = props;

  const isPaymentRequest = !!props.navigation.state.params.amountInFiat;

  const amountSAT =
    +amount *
    (1 - orderInit.feePre / 100) *
    Number(currencyExchangeRatePay) *
    100000000;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <View style={{ flex: 1 }}>
          <Header
            headerText={
              <View style={styles.otherPayScan}>
                <PaymentNameWithLogo
                  paymentId={payment.paymentId}
                  linkedInfo={props.navigation.state.params.linkedInfo}
                />
              </View>
            }
            onBackPress={() => {
              navigation.goBack();
            }}
          />

          <Text
            style={{
              fontSize: 10,
              color: Colors.ChateauGrey,
              alignSelf: "center",
              marginTop: 20
            }}
          >
            {isPaymentRequest ? "" : props.navigation.state.params.linkedInfo}
          </Text>
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff"
            }}
          >
            <View style={{ flex: 1 }} />
            {renderAmountInfo()}
            {!isPaymentRequest ? (
              <KeyPad
                value={amount}
                onChange={setAmount}
                style={{
                  marginBottom: 20
                }}
              />
            ) : (
              <View style={{ height: 240 }} />
            )}
          </View>
          <FiatFiatButton
            amount={amount}
            linkedInfo={props.navigation.state.params.linkedInfo}
            amountSAT={amountSAT}
            paymentId={payment.paymentId}
            enoughBalance={balanceSAT >= amountSAT}
            onPress={handleConfirmBSV}
            title={amount ? I18n.t("send") : I18n.t("typeofamounttosend")}
          />
        </View>
        <Loader visible={loading} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  bitcoinView: {
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 15,
    height: 70,
    justifyContent: "center",
    alignItems: "center"
  },

  lblAmountInfoFee: {
    backgroundColor: "#fff",
    color: "rgb(144,148,156)",
    fontSize: 16,
    textAlign: "center",
    padding: 10,
    textAlignVertical: "center"
  },

  lblAmountInfoWarning: {
    backgroundColor: "#fff",
    color: "rgb(245,166,35)",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
    padding: 10,
    textAlignVertical: "center"
  },

  txtBitCoinFill: {
    fontSize: 50,
    color: "rgb(0,0,0)",
    marginLeft: 5
  },
  placeholderStyle: {
    fontSize: 50,
    color: Colors.LightGrey
  },
  unit: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000"
  },
  otherPayScan: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    width: "100%"
  }
});
