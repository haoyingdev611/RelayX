import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants";
import { NavigationEvents } from "react-navigation";
import PayWithSheet from "./PayWithSheet";
import { BottomPrimaryButton as PrimaryButton } from "./PrimaryButton";
import I18n from "../locales";
import { useSelector } from "react-redux";
import { AppState } from "../../reducers";
import { useApi, SplitLimitInfo } from "../api";
import { useDidMount } from "../hooks/useDidMount";
import { getPaymentById } from "../selectors/paymentSelectors";

interface Props {
  title: string;
  address: string;
  sendHandle?: string;
  amountSAT: number;
  enoughBalance: boolean;
  payable: boolean;
  onPress: () => any;
}

function FiatButton(props: Props) {
  const api = useApi();
  const { title, enoughBalance, payable, amountSAT } = props;

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
      {((payable && canPayWith) || enoughBalance) && (
        <PrimaryButton
          title={title}
          disabled={amountSAT === 0}
          onPress={onPress}
        />
      )}
      {!((payable && canPayWith) || enoughBalance) && (
        <View style={styles.container}>
          <Text style={styles.infoText}>{I18n.t("notEnoughFunds")}</Text>
        </View>
      )}
      {!!showModal && (
        <PayWithSheet
          visible={!!focused}
          address={props.address}
          sendHandle={props.sendHandle}
          amountSAT={amountSAT}
          paymentId={selectedPaymentId}
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

export default FiatButton;
