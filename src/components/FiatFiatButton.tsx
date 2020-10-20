import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants";
import { NavigationEvents } from "react-navigation";
import PayWithSheetFiatFiat from "./PayWithSheetFiatFiat";
import { BottomPrimaryButton as PrimaryButton } from "./PrimaryButton";
import I18n from "../locales";
import { useSelector } from "react-redux";
import { AppState } from "../../reducers";
import { useApi, SplitLimitInfo } from "../api";
import { useDidMount } from "../hooks/useDidMount";
import { getPaymentById } from "../selectors/paymentSelectors";

interface Props {
  title: string;
  amount: string;
  amountSAT: number;
  paymentId: number;
  linkedInfo: string;
  enoughBalance: boolean;

  onPress: () => any;
}

function FiatFiatButton(props: Props) {
  const api = useApi();
  const {
    title,
    enoughBalance,
    amount,
    amountSAT,
    paymentId,
    linkedInfo
  } = props;

  const state = useSelector((state: AppState) => state);
  const rates = state.currency;
  const lastPaymentId = state.settingReducer.lastUsedPayWithPaymentId;

  const [selectedPaymentId, setSelectedPaymentId] = useState<
    number | undefined
  >(lastPaymentId);
  const [focused, setFocused] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [limits, setLimits] = useState<SplitLimitInfo[]>([]);

  useDidMount(async () => {
    const data = await api.fetchSplitLimits();
    setLimits(data.data);
  });

  const canPayWith = useMemo(() => {
    let minSend = Number.MAX_SAFE_INTEGER;
    let maxSend = 0;
    limits.forEach(l => {
      const rate = rates[getPaymentById(state, l.paymentId).symbolId] || 1;

      minSend = Math.min(l.walletMinSplitAmount * rate * 100000000, minSend);
      maxSend = Math.max(
        l.walletMaxSplitReceiveAmount * rate * 100000000,
        maxSend
      );
    });

    return amountSAT >= minSend && amountSAT <= maxSend;
  }, [limits, rates, amountSAT]);

  function onPress() {
    if (enoughBalance) {
      props.onPress();
      return;
    }

    setShowModal(true);
  }

  return (
    <View>
      <NavigationEvents
        onWillBlur={() => setFocused(false)}
        onWillFocus={() => setFocused(true)}
      />
      {(canPayWith || enoughBalance) && (
        <PrimaryButton
          title={title}
          disabled={(+amount || 0) === 0}
          onPress={onPress}
        />
      )}
      {!(canPayWith || enoughBalance) && (
        <View style={styles.container}>
          <Text style={styles.infoText}>{I18n.t("notEnoughFunds")}</Text>
        </View>
      )}
      {!!showModal && (
        <PayWithSheetFiatFiat
          visible={!!focused}
          amountSAT={amountSAT}
          paymentId={selectedPaymentId}
          receivePaymentId={paymentId}
          receiveAmount={+amount}
          receiveAccount={linkedInfo}
          onChange={paymentId => setSelectedPaymentId(paymentId)}
          onRequestClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    marginBottom: 20,
    height: 50,
    backgroundColor: Colors.LightPeriwinkleWithOpacity(0.3),
    overflow: "hidden",
    marginHorizontal: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  infoText: {
    textAlign: "center",
    fontSize: 19,
    color: Colors.DarkGrey
  }
});

export default FiatFiatButton;
