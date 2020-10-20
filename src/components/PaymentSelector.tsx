import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";

import I18n from "../locales";
import { PaymentMeta } from "../../src/api";
import { AppState } from "../../reducers";
import { connect, NavigationProps } from "../types";
import { PayWallet } from "../constants";
import { getPaymentById } from "../selectors/paymentSelectors";
import { PaymentDestinationName } from "./PaymentNameWithLogo";

type Callback = (item: PaymentMeta) => boolean;

export interface OwnProps {
  paymentId: number;
  linkedInfo: string;
  dataSource?(): Promise<PaymentMeta[]>;
  onChange(args: { paymentId: number; linkedInfo: string }): any;
  // linkedInfo would be empty if true
  onlyPayment: boolean | Callback;
  itemSubTitle?: (item: PaymentMeta) => string;
  filter?(item: PaymentMeta): boolean;
  optional?: boolean;
  readonly?: boolean;
}

interface ReduxProps {
  payment?: PaymentMeta;
}

type Props = OwnProps & ReduxProps & NavigationProps<any>;

interface State {
  pasted: boolean;
}

export class PaymentSelector extends React.Component<Props, State> {
  onSelectWallet = () => {
    if (this.props.readonly) {
      return;
    }
    this.props.navigation.push("selectPaymentMethod", {
      selected: this.props.paymentId,
      onSelect: this.props.onChange,
      dataSource: this.props.dataSource,
      onlyPayment: this.props.onlyPayment,
      itemSubTitle: this.props.itemSubTitle,
      filter: this.props.filter
    });
  };

  render() {
    const { payment, optional, readonly } = this.props;
    if (!payment && !optional) {
      throw new Error("Payment resolution error");
    }

    if (!payment && optional) {
      return (
        <TouchableOpacity onPress={this.onSelectWallet}>
          <View style={styles.currencyWrapper}>
            <View
              style={{ flexDirection: "row", justifyContent: "flex-start" }}
            >
              <Text style={styles.currencyTitle}>
                {I18n.t("paymentMethod")}
              </Text>
            </View>
            <Text style={styles.changeText}>{I18n.t("change")}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const paymentName = payment!.paymentName;

    return (
      <TouchableOpacity onPress={this.onSelectWallet}>
        <View style={styles.currencyWrapper}>
          <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
            <Image
              source={PayWallet[paymentName]}
              style={styles.currencyImage}
            />
            <PaymentDestinationName
              style={styles.currencyTitle}
              paymentId={payment!.paymentId}
              linkedInfo={this.props.linkedInfo}
            />
          </View>
          {!readonly && (
            <Text style={styles.changeText}>{I18n.t("change")}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  currencyWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgb(248, 248, 250)"
  },
  currencyImage: {
    width: 27,
    height: 27
  },
  currencyTitle: {
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 27,
    fontWeight: "500"
  },
  changeText: {
    fontSize: 16,
    marginRight: 12,
    color: "#2669FF"
  }
});

const mapStateToProps = (state: AppState, props: OwnProps): ReduxProps => {
  try {
    return {
      payment: getPaymentById(state, props.paymentId)
    };
  } catch {
    return { payment: void 0 };
  }
};

export default connect(mapStateToProps)(PaymentSelector);
