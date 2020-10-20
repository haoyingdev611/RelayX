import React, { Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import I18n from "../locales";
import { Colors } from "../constants";
import { PayWallet } from "../../src/constants";
import util from "../../utils/util";
import { NavigationProps } from "../types";
import IconWithMark from "../components/IconWithMark";

function IconWithStatus({ image, status }: { image: number; status: string }) {
  switch (status) {
    case "pending":
      return (
        <IconWithMark
          image={image}
          markBg={Colors.ClearBlue}
          mark={"pending"}
        />
      );
    case "cancelled":
      return (
        <IconWithMark
          image={image}
          markBg={Colors.DarkBlueGrey}
          mark={"close"}
        />
      );
    default:
      return (
        <IconWithMark image={image} markBg={Colors.FrogGreen} mark={"check"} />
      );
  }
}

interface Props extends NavigationProps<any> {
  status: number;
  payMode: number;
  payMark: string;
  tranType: number;
  localAmount: number;
  localSymbolSign: string;
  serialNumber: string;
  createdDate: string;
}

interface State {
  isHidden: boolean;
}

class Transaction extends Component<Props, State> {
  state: State = {
    isHidden: false
  };

  // 切换显隐
  goToDetail = () => {
    const { serialNumber, tranType } = this.props;
    this.props.navigation.navigate("transactionDetail", {
      orderId: serialNumber,
      tranType
    });
  };

  getPayLogo = (payMark: string, payMode: number) => {
    if (payMode === 1) {
      if (payMark.substring(0, 1) === "$" || payMark.endsWith("@handcash.io")) {
        return require("../../icons/methods/handcash.png");
      } else if (payMark.endsWith("@moneybutton.com")) {
        return require("../../icons/methods/moneybutton.png");
      } else if (payMark.endsWith("@simply.cash")) {
        return require("../../icons/methods/sc.png");
      } else if (payMark.substring(0, 1) === "1" && payMark.length < 25) {
        return require("../../icons/methods/relay.png");
      } else if (payMark.startsWith("float:")) {
        return require("../../icons/methods/floatsv.png");
      } else if (payMark.startsWith("okex:")) {
        return require("../../icons/methods/okex.png");
      }
      return require("../../icons/methods/bsv.png");
    }
    return PayWallet[payMark];
  };

  render() {
    const {
      payMode,
      payMark,
      tranType,
      localAmount,
      localSymbolSign,
      createdDate,
      status
    } = this.props;

    let readableStatus = "pending";
    if (status === 10000) {
      readableStatus = "done";
    }

    if (status === -200) {
      readableStatus = "cancelled";
    }

    return (
      <View>
        <TouchableOpacity activeOpacity={0.5} onPress={() => this.goToDetail()}>
          <View style={{ opacity: readableStatus === "cancelled" ? 0.5 : 1 }}>
            <View style={[styles.list]}>
              <View style={[styles.payment]}>
                <IconWithStatus
                  image={this.getPayLogo(payMark, payMode)}
                  status={readableStatus}
                />

                <View style={styles.paymentColumn}>
                  <Text style={styles.user}>
                    {I18n.t(payMark, {
                      defaultValue: payMark
                        .replace("float:", "")
                        .replace("okex:", "")
                    })}
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.amount,
                    {
                      color:
                        readableStatus === "cancelled"
                          ? Colors.BlueyGrey
                          : tranType === 1
                          ? Colors.OrangeYellow
                          : Colors.FrogGreen
                    }
                  ]}
                >
                  {tranType === 1 ? "-" : "+"} {localSymbolSign}{" "}
                  {util.roundCurrency(util.round(localAmount))}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: 13,
                      opacity: 0.7,
                      color: Colors.BlueyGrey,
                      textAlign: "right"
                    }
                  ]}
                >
                  {util.formatCalendar(util.parseDate(createdDate))}
                </Text>
              </View>
            </View>
            {/* this.state.isHidden && (
              <View style={[styles.detailView]}>
                <View style={[styles.detail]}>
                  <Text style={[styles.content]}>{I18n.t("relayFee")}</Text>
                  <Text style={[styles.content]}>$ 0.75</Text>
                </View>
                <View style={[styles.detail]}>
                  <Text style={[styles.content]}>{I18n.t("relayFee")}</Text>
                  <Text style={[styles.content]}>$ 0.75</Text>
                </View>
                <View style={[styles.detail]}>
                  <Text style={[styles.content]}>{I18n.t("networkFee")}</Text>
                  <Text style={[styles.content]}>$ 0.75</Text>
                </View>
                <View style={[styles.explorerView]}>
                  <Text style={[styles.explorer]}>
                    {I18n.t("viewInExploxer")}
                  </Text>
                </View>
              </View>
            ) */}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  static defaultProps = {
    payMode: 1,
    payMark: "",
    tranType: 1,
    localAmount: 0,
    localSymbolSign: "",
    serialNumber: "",
    createdDate: ""
  };
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 14,
    height: 80,
    backgroundColor: "#fff",
    borderBottomColor: "#e9e9e9",
    borderBottomWidth: 1
  },
  payment: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  paymentColumn: {
    marginLeft: 10,
    justifyContent: "center"
  },

  user: {
    fontSize: 13,
    lineHeight: 13,
    color: "#2a2a2e",
    fontWeight: "500"
  },

  amount: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: "right"
  }
});

export default Transaction;
