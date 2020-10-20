import React, { useState, useEffect } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Clipboard
} from "react-native";
import QRCode from "react-native-qrcode";
import I18n from "../src/locales";
import util from "../utils/util";
import { Colors } from "../src/constants";
import { PayWallet } from "../src/constants";
import Permissions from "react-native-permissions";
import { LinkButton } from "../src/components/LinkButton";
import { Loader } from "../src/components/Loader";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useUpdateExchangeRates } from "../actions/CurrencyActions";
import { useApi } from "../src/api";
import { getPaymentById } from "../src/selectors/paymentSelectors";
import { Header } from "../src/components/Header";
import URL from "../utils/URL";
import { useSelector } from "react-redux";
import { useBalanceUpdate } from "../src/hooks/useBalanceUpdate";
import { useDidMount } from "../src/hooks/useDidMount";
import { useInterval } from "../src/hooks/useInterval";

interface OwnProps
  extends NavigationProps<{
    orderId: string;
    amountSAT: number;
    paymentId: number;
    sendHandle?: string;
  }> {}

type Props = OwnProps;

export default function ReceiveCodeScreen(props: Props) {
  const api = useApi();
  const checkBalanceUpdate = useBalanceUpdate();
  const updateExchangeRates = useUpdateExchangeRates();
  const { payment, currencyExchangeRate, localSymbolSign } = useSelector(
    (state: AppState) => {
      const { main, currency } = state;
      return {
        localSymbolSign: main.localSymbolSign,
        symbolId: main.symbolId,
        currencyExchangeRate: currency[main.symbolId] || 1,
        payment: getPaymentById(state, props.navigation.state.params.paymentId)
      };
    }
  );
  const [timer, setTimer] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [linkedInfo, setLinkedInfo] = useState("");
  const [walletSendAmount, setWalletSendAmount] = useState("");
  const isWalletCrypto = payment.paymentId > 10000;
  const orderNumber = props.navigation.state.params.orderId;

  useDidMount(() => {
    onFetch();
    if (Platform.OS === "ios") {
      Permissions.request("photo");
    }
  });

  useInterval(function countDown() {
    if (!linkedInfo) {
      return;
    }
    if (timer > 0) {
      setTimer(timer - 1);
    } else if (timer === 0 && !loading) {
      props.navigation.navigate("expiredPage", {
        linkedInfo: linkedInfo,
        paymentId: props.navigation.state.params.paymentId,
        walletSendAmount: walletSendAmount
      });
    }
  }, 1000);

  // 请求数据
  async function onFetch() {
    try {
      const res = await api.earnGetDetail(orderNumber, 2);
      if (res.data.status === 100) {
        setTimer(res.data.expireTime);
        setLinkedInfo(res.data.jsonInfo);
        setWalletSendAmount(res.data.walletSendAmount);

        await updateExchangeRates();
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  // 关闭
  async function onRechargeClose() {
    // FIXME: this stops countdown
    setLoading(true);
    try {
      await api.cancelRecharge(orderNumber);
      props.navigation.navigate("scan");
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  // 发送
  async function onRechargeCreateSent() {
    setLoading(true);
    try {
      const res = await api.rechargeSend(orderNumber);
      await checkBalanceUpdate();
      if (res.code === 0) {
        props.navigation.replace("transactionDetail", {
          orderId: orderNumber,
          tranType: 2,
          autoClose: true
        });
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  // go to app
  const goToApp = () => util.openUrlBrowser(linkedInfo);

  // 复制
  async function onCopyInfo() {
    let address = linkedInfo;
    if (linkedInfo.indexOf(":") >= 0) {
      if (linkedInfo.indexOf("?") >= 0) {
        address = address.substring(
          address.lastIndexOf(":") + 1,
          address.lastIndexOf("?")
        );
      } else {
        address.substring(address.lastIndexOf(":") + 1);
      }
    }

    Clipboard.setString(address);
    setCopied(true);
  }

  const { navigation } = props;
  let isGoToApp = false;
  if (linkedInfo && linkedInfo.toLowerCase().indexOf("http") === 0) {
    isGoToApp = true;
  }

  useEffect(() => {
    if (linkedInfo && isGoToApp) util.openUrlBrowser(linkedInfo);
  }, [linkedInfo]);

  const sender = navigation.state.params.sendHandle || I18n.t("you");

  const amountSAT = Number(navigation.state.params.amountSAT);
  const amount = amountSAT / currencyExchangeRate / 100000000.0;
  const localCurrencyAmount = amount.toFixed(2);

  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ backgroundColor: "#fff", flex: 1 }}>
        <Header
          hideBack
          headerText={I18n.t("addFunds")}
          rightButtonText={I18n.t("help")}
          onRightPress={() => util.openUrlBrowser(URL.RELAYX_TELEGRAM)}
          onBackPress={() => {}}
        />
        <View style={styles.qrContent}>
          <View style={[styles.qrcode, styles.qrWrapper]}>
            <QRCode value={linkedInfo} size={200} />
            <View style={styles.relayInQr}>
              <Image
                resizeMode="contain"
                source={PayWallet[payment.paymentName]}
                style={{ width: 40, height: 40 }}
              />
            </View>
          </View>
          <View style={[styles.method]}>
            <Text allowFontScaling={false} style={[styles.company]}>
              {payment.sign}
            </Text>
            <Text allowFontScaling={false} style={[styles.amount]}>
              {util.showCurrencyString(walletSendAmount as any, isWalletCrypto)}
            </Text>
          </View>
          <View style={[styles.method]}>
            <Text allowFontScaling={false} style={[styles.amountFee]}>
              {I18n.t("youWillReceive", {
                sender: I18n.t(sender, { defaultValue: sender }),
                amount: `${localSymbolSign} ${localCurrencyAmount}`
              })}
            </Text>
          </View>
          <View style={[styles.method]}>
            <Text style={styles.textTimer}>
              {timer > 0 ? I18n.t("expiresTime", { seconds: timer }) : ""}
            </Text>
          </View>
          {isWalletCrypto && (
            <LinkButton
              title={copied ? I18n.t("copied") : I18n.t("copyAddress")}
              onPress={onCopyInfo}
            />
          )}
          {isGoToApp && (
            <Text
              style={{
                fontSize: 16,
                color: "#2669ff",
                textAlign: "center",
                marginTop: 20
              }}
              onPress={goToApp}
            >
              {I18n.t("goToWallet", {
                walletName: I18n.t(payment.paymentName, {
                  defaultValue: payment.paymentName
                })
              })}
            </Text>
          )}
        </View>
        <View style={[styles.buttonView]}>
          <TouchableOpacity activeOpacity={0.5} onPress={onRechargeClose}>
            <View
              style={[
                styles.sentView,
                { backgroundColor: "rgba(204, 220, 255, 0.3)" }
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[styles.sent, { color: "#2669ff" }]}
              >
                {I18n.t("cancel")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={onRechargeCreateSent}
            disabled={false}
          >
            <View style={[styles.sentView, { opacity: 1 }]}>
              <Text allowFontScaling={false} style={[styles.sent]}>
                {I18n.t("sent")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Loader visible={loading} theme="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0
  },
  sentView: {
    width: 160,
    backgroundColor: "#2669ff",
    borderRadius: 5,
    height: 50,
    justifyContent: "center"
  },
  sent: {
    fontWeight: "bold",
    fontSize: 19,
    textAlign: "center",
    color: "#fff"
  },
  qrWrapper: {
    overflow: "hidden",
    width: 200,
    height: 200
  },
  qrcode: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 90,
    marginBottom: 10
  },
  method: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5
  },
  company: {
    fontSize: 19,
    lineHeight: 53,
    color: "#000",
    fontWeight: "500",
    marginRight: 5,
    fontFamily: Platform.OS === "ios" ? void 0 : ""
  },
  amount: {
    fontSize: 45,
    lineHeight: 53,
    color: "#000",
    fontWeight: "500"
  },
  amountFee: {
    fontSize: 14,
    lineHeight: 16,
    color: "#90949c"
  },
  relayInQr: {
    position: "absolute",
    left: 78,
    top: 78,
    padding: 4,
    backgroundColor: "white"
  },
  qrContent: {
    justifyContent: "center",
    alignItems: "center"
  },
  textTimer: { fontSize: 14, color: Colors.LightGrey, fontWeight: "500" }
});
