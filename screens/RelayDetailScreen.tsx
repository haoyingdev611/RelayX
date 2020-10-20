import React, { Component } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text
} from "react-native";
import I18n from "../src/locales";
import { Colors } from "../src/constants";
import util from "../utils/util";
import { NavigationProps } from "../src/types";

interface OwnProps {}

type Props = OwnProps &
  NavigationProps<{
    direction: "toRelayOne" | "fromRelayOne";
    orderNumber?: string;
    currencySign: string;
    amountLocal: number;
    txHash: string;
  }>;

class RelayDetailScreen extends Component<Props> {
  state = {
    orderNumber:
      this.props.navigation.state.params.direction === "toRelayOne"
        ? this.props.navigation.state.params.orderNumber
        : ""
  };

  handleBackPress = () => this.props.navigation.navigate("scan");

  handleDetailPress = () => {
    const params = this.props.navigation.state.params;
    if (params.direction === "fromRelayOne") {
      util.openUrlBrowser("https://www.whatsonchain.com/tx/" + params.txHash);
    } else {
      this.props.navigation.navigate("transactionDetail", {
        orderId: this.state.orderNumber!,
        tranType: 1
      });
    }
  };

  render() {
    const {
      amountLocal,
      currencySign,
      direction
    } = this.props.navigation.state.params;

    // If receive/sent views diverge too much please refactor into separate components
    const isSent = direction === "toRelayOne";

    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.mainView}>
            <View style={[styles.button, styles.acceptButton]}>
              <Image
                resizeMode="contain"
                source={require("../icons/selected.png")}
                style={styles.acceptImage}
              />
            </View>
            <Text style={styles.fund}>
              {isSent
                ? I18n.t("sendSuccessMessage", {
                    recipient: I18n.t("relayone")
                  })
                : I18n.t("receiveSuccessMessage", {
                    recipient: I18n.t("relayone")
                  })}
            </Text>
            <View style={styles.numberView}>
              <Text style={styles.unit}>{currencySign}</Text>
              <Text style={styles.number}>{amountLocal.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.footer}
            onPress={this.handleBackPress}
          >
            <View style={styles.sentView}>
              <Text allowFontScaling={false} style={styles.sent}>
                {I18n.t("ok")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  mainView: {
    marginTop: 190,
    marginBottom: 55,
    justifyContent: "center",
    alignItems: "center"
  },
  fund: {
    fontSize: 14,
    lineHeight: 18,
    color: "#000",
    marginTop: 18,
    textAlign: "center"
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  acceptButton: { borderColor: Colors.FrogGreen },
  acceptImage: { width: 40, height: 40, tintColor: Colors.FrogGreen },
  numberView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 70
  },
  number: {
    fontSize: 45,
    lineHeight: 52,
    color: "rgb(42, 42, 46)"
  },
  unit: {
    fontSize: 19,
    fontWeight: "bold",
    lineHeight: 52,
    color: "rgb(42, 42, 46)",
    marginRight: 5
  },
  footer: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    padding: 15
  },
  sentView: {
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    backgroundColor: Colors.ClearBlue
  },
  sent: {
    fontWeight: "bold",
    fontSize: 19,
    textAlign: "center",
    color: "#fff"
  }
});

export default RelayDetailScreen;
