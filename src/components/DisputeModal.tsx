import React from "react";
import { Modal, View, TouchableOpacity, Text } from "react-native";
import I18n from "../locales";
import { Colors } from "../constants";
import { PaymentNameWithLogo } from "./PaymentNameWithLogo";
import { getPaymentById } from "../selectors/paymentSelectors";
import { connect } from "../types";
import { PaymentMeta } from "../../src/api";
import { AppState } from "../../reducers";

interface OwnProps {
  visible: boolean;
  serialNumber: string;
  paymentId: number;
  linkedInfo: string;
  walletSymbolSign: string;
  walletSendAmount?: string;
  onPressYes: () => any;
  onPressCancel: () => any;
}

interface ReduxProps {
  payment: PaymentMeta;
}

type Props = OwnProps & ReduxProps;

const DisputeModal = ({
  visible,
  serialNumber,
  walletSymbolSign,
  walletSendAmount,
  paymentId,
  linkedInfo,
  payment,
  onPressCancel,
  onPressYes
}: Props) => {
  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <PaymentNameWithLogo
              paymentId={paymentId}
              linkedInfo={linkedInfo}
            />
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>
              {I18n.t("disputeMessage", {
                paymentName:
                  I18n.t(payment.paymentName, {
                    defaultValue: payment.paymentName
                  }) || ""
              })}
            </Text>

            <View>
              <Text style={styles.textReceive}>
                {I18n.t("sentConfirmMessage")}
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
                style={[styles.button, styles.acceptButton]}
                onPress={onPressYes}
              >
                <Text style={styles.acceptButtonTitle}>
                  {I18n.t("yes")}. {I18n.t("uploadProof")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onPressCancel}
              >
                <Text style={styles.cancelButtonTitle}>{I18n.t("no")}</Text>
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
    paddingBottom: 20,
    lineHeight: 28,
    textAlign: "center" as "center"
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
    justifyContent: "center" as "center"
  },
  button: {
    width: 185,
    height: 50,
    borderRadius: 5,
    justifyContent: "center" as "center",
    alignItems: "center" as "center",
    marginBottom: 15
  },
  acceptButton: { backgroundColor: Colors.ClearBlue },
  cancelButton: { backgroundColor: Colors.LightPeriwinkleWithOpacity(0.3) },
  acceptButtonTitle: { color: "white", fontSize: 19 },
  cancelButtonTitle: { color: Colors.ClearBlue, fontSize: 19 },
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

function mapStateToProps(state: AppState, props: OwnProps): ReduxProps {
  return {
    payment: getPaymentById(state, props.paymentId)
  };
}

export default connect(mapStateToProps)(DisputeModal);
