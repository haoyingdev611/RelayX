import React from "react";
import { Modal, View, TouchableOpacity, Text, Image } from "react-native";
import I18n from "../locales";
import { Colors } from "../constants";
import { PayWallet } from "../constants";

import get from "lodash/get";
import { useOnReceived, useOnNotReceived } from "../../actions/OrdersActions";

type Props = {
  visible: boolean;
  serialNumber: string;
  payModeName: string;
  walletSymbolSign: string;
  walletSendAmount: string;
  onPressYes: (orderId: string) => any;
  onPressCancel: (orderId: string) => any;
};

const WithdrawTransactionModal = ({
  visible,
  serialNumber,
  payModeName,
  walletSymbolSign,
  walletSendAmount,
  onPressCancel,
  onPressYes
}: Props) => {
  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            {payModeName && (
              <Image
                source={PayWallet[payModeName]}
                style={styles.walletImage}
              />
            )}
            <Text style={styles.headerText}>
              {I18n.t(payModeName, {
                defaultValue: payModeName
              }) || ""}
            </Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              {I18n.t("paymentIndicateMessage", {
                payModeName:
                  I18n.t(payModeName, {
                    defaultValue: payModeName
                  }) || ""
              })}
            </Text>

            <View>
              <Text style={styles.textReceive}>
                {I18n.t("askReceivePaymentMessage")}
              </Text>

              <View style={styles.currencies}>
                <Text style={styles.currencySymbol}>
                  {walletSymbolSign || ""}
                </Text>
                <Text style={styles.amount}>{walletSendAmount || ""}</Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => onPressCancel(serialNumber)}
              >
                <Image
                  resizeMode="contain"
                  source={require("../../icons/back.png")}
                  style={styles.cancelImage}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => onPressYes(serialNumber)}
              >
                <Image
                  resizeMode="contain"
                  source={require("../../icons/selected.png")}
                  style={styles.acceptImage}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.warningView}>
              <Text style={styles.warningText}>
                {I18n.t("falseConfirmWarnMessage")}
              </Text>
            </View>

            <Text style={styles.transactionText}>
              TXID {serialNumber || ""}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    padding: 15,
    width: "100%",
    flex: 1,
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    backgroundColor: Colors.DarkBlueGrey
  },
  content: {
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: "white",
    height: "80%",
    width: "100%"
  },

  header: {
    flexDirection: "row" as "row",
    paddingVertical: 8,
    alignItems: "center" as "center",
    justifyContent: "center" as "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED"
  },
  headerText: { marginLeft: 8, fontSize: 16 },
  walletImage: { width: 28, height: 28, borderRadius: 14 },

  body: {
    flex: 1,
    paddingVertical: 45,
    justifyContent: "space-between" as "space-between",
    alignItems: "center" as "center"
  },
  currencies: {
    flexDirection: "row" as "row",
    justifyContent: "center" as "center",
    alignItems: "center" as "center"
  },
  textReceive: {
    fontSize: 19,
    color: "#000",
    fontWeight: "bold" as "bold",
    lineHeight: 60
  },
  currencySymbol: {
    fontSize: 19,
    color: Colors.DarkGrey,
    fontWeight: "bold" as "bold"
  },
  amount: {
    fontSize: 45,
    color: Colors.DarkGrey,
    fontWeight: "bold" as "bold"
  },
  description: {
    paddingTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.BlueyGrey,
    textAlign: "center" as "center"
  },
  buttons: {
    width: "100%",
    flexDirection: "row" as "row",
    paddingHorizontal: 60,
    justifyContent: "space-between" as "space-between"
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    justifyContent: "center" as "center",
    alignItems: "center" as "center"
  },
  acceptButton: { borderColor: Colors.FrogGreen },
  cancelButton: { borderColor: Colors.OrangeYellow },
  acceptImage: { width: 40, height: 40, tintColor: Colors.FrogGreen },
  cancelImage: { width: 28, height: 28, tintColor: Colors.OrangeYellow },

  footer: {
    alignItems: "center" as "center",
    justifyContent: "center" as "center",
    paddingHorizontal: 20
  },
  warningView: {
    width: "100%",
    padding: 8,
    backgroundColor: Colors.OrangeYellowWithOpacity(0.1),
    alignItems: "center" as "center"
  },
  warningText: { fontSize: 12, color: Colors.OrangeYellow },
  transactionText: {
    marginTop: 10,
    color: Colors.LightGrey,
    fontSize: 13
  }
};

export { WithdrawTransactionModal };

import { State } from "../../reducers";
import { useSelector } from "react-redux";

export default function WithdrawTransactionModalConnected() {
  const { isVisibleReceiveModal, lastOrderDetail } = useSelector(
    mapStateToProps
  );
  const onReceived = useOnReceived();
  const onNotReceived = useOnNotReceived();

  return (
    <WithdrawTransactionModal
      visible={isVisibleReceiveModal}
      serialNumber={get(lastOrderDetail, "serialNumber")}
      walletSymbolSign={get(lastOrderDetail, "walletSymbolSign")}
      payModeName={get(lastOrderDetail, "payModeName")}
      walletSendAmount={get(lastOrderDetail, "walletSendAmount")}
      onPressYes={onReceived}
      onPressCancel={onNotReceived}
    />
  );
}

function mapStateToProps({ orders }: State) {
  return {
    isVisibleReceiveModal: !!orders.showModalForOrder,
    lastOrderDetail: orders.index[orders.showModalForOrder]
  };
}
