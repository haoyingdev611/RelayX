import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Text,
  Platform,
  TouchableOpacity
} from "react-native";
import I18n from "../src/locales";
import { Header } from "../src/components/Header";
import QRCode from "react-native-qrcode";
import { PayWallet } from "../src/constants";
import { NavigationProps } from "../src/types";
import { AppState } from "../reducers";
import { useSelector } from "react-redux";
import { getPaymentById } from "../src/selectors/paymentSelectors";

interface OwnProps
  extends NavigationProps<{
    linkedInfo: string;
    paymentId: number;
    walletSendAmount: any;
  }> {}

type Props = OwnProps;

export default function ExpiredPageScreen(props: Props) {
  const { payment } = useSelector((state: AppState) => {
    const { main, currency } = state;
    return {
      localSymbolSign: main.localSymbolSign,
      symbolId: main.symbolId,
      currencyExchangeRate: currency[main.symbolId] || 1,
      payment: getPaymentById(state, props.navigation.state.params.paymentId)
    };
  });

  const [linkedInfo] = useState(props.navigation.state.params.linkedInfo);

  const [walletSendAmount] = useState(
    props.navigation.state.params.walletSendAmount
  );

  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <View style={{ backgroundColor: "#fff", flex: 1 }}>
        <Header
          hideBack
          headerText={I18n.t("expired")}
          rightButtonText={I18n.t("close")}
          onRightPress={() => {
            props.navigation.navigate("scan");
          }}
          onBackPress={() => {}}
        />
        <View style={[styles.qrContent]}>
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
        </View>
        <Text
          style={{
            opacity: 0.3,
            fontSize: 16,
            color: "#2669ff",
            textAlign: "center",
            marginTop: 20
          }}
        >
          {I18n.t("goToWallet", {
            walletName: I18n.t(payment.paymentName, {
              defaultValue: payment.paymentName
            })
          })}
        </Text>
        <View style={[styles.method]}>
          <Text style={[styles.company]}>{payment.sign}</Text>
          <Text style={[styles.amount]}>{walletSendAmount}</Text>
        </View>
        <View style={[styles.buttonView]}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => props.navigation.navigate("scan")}
          >
            <View
              style={[
                styles.buttonBackToAddFunds,
                { backgroundColor: "#2669ff" }
              ]}
            >
              <Text
                allowFontScaling={false}
                style={[styles.sent, { color: "rgba(204, 220, 255, 1)" }]}
              >
                {I18n.t("backToAddFunds")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  qrcode: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 90,
    marginBottom: 10
  },
  qrWrapper: {
    overflow: "hidden",
    width: 200,
    height: 200
  },
  relayInQr: {
    position: "absolute",
    left: 78,
    top: 78,
    padding: 4,
    backgroundColor: "white"
  },
  qrContent: {
    opacity: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  method: {
    opacity: 0.3,
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
  buttonView: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0
  },
  buttonBackToAddFunds: {
    width: 360,
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
  }
});
