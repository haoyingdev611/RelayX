import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PaymentSelector, {
  OwnProps as PaymentSelectorProps
} from "../../src/components/PaymentSelector";
import { BottomPrimaryButton } from "../../src/components/PrimaryButton";
import util from "../../utils/util";
import Sheet from "./Sheet";
import { NavigationProps } from "../types";

interface Props {
  isLoading: boolean;
  disabled: boolean;
  amount: number;
  sign: string;
  header: string;
  submitTitle: string;
  onSubmit(): any;
  onRequestClose(): any;

  paymentSelectorProps: PaymentSelectorProps & NavigationProps<any>;
}

export default function PayWithSheetPure(props: Props) {
  const {
    isLoading,
    disabled,
    sign,
    amount,
    onSubmit,
    header,
    submitTitle
  } = props;
  return (
    <Sheet onRequestClose={props.onRequestClose} loading={isLoading}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 20 }}>{header}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 20,
          paddingTop: 20
        }}
      >
        <Text style={[styles.unit, { color: "black" }]}>
          {isLoading ? " " : sign}
        </Text>
        <Text
          style={[
            styles.txtBitCoinFill,
            {
              fontSize: 30
            }
          ]}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          { isLoading && (" ")}
          { !isLoading && props.paymentSelectorProps.paymentId < 10000 && (util.formatCurrency(util.round(amount))) }
          { !isLoading && props.paymentSelectorProps.paymentId >= 10000 && (util.formatCurrency(amount))}
        </Text>
      </View>
      <View style={styles.header}>
        <View
          style={{
            paddingTop: 30,
            paddingLeft: 20,
            paddingRight: 20
          }}
        >
          <PaymentSelector {...props.paymentSelectorProps} />
        </View>
        <View style={{ paddingTop: 20 }}>
          <BottomPrimaryButton
            disabled={disabled}
            onPress={onSubmit}
            title={submitTitle}
          />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
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
  header: {
    height: 100,
    justifyContent: "center"
  }
});
