import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { withNavigation } from "react-navigation";
import { AppState } from "../../reducers";
import util from "../../utils/util";
import I18n from "../locales";
import { NavigationProps, useDispatch } from "../types";
import { useApi, PaymentMeta } from "../api";
import { getPaymentById } from "../selectors/paymentSelectors";
import { saveLastUsedPayWithPaymentId } from "../../actions";
import PayWithSheetPure from "./PayWithSheetPure";

function getAvailablePayment(
  paymentId: number | undefined,
  payments: PaymentMeta[] | null
) {
  if (payments && payments.length) {
    const payment =
      payments.find(p => p.paymentId === paymentId) || payments[0];
    return payment.paymentId;
  }

  return void 0;
}

interface Props {
  visible: boolean;
  sendHandle?: string;
  amountSAT: number;
  receivePaymentId: number;
  receiveAmount: number;
  receiveAccount: string;
  paymentId: number | undefined;
  onChange: (paymentId: number) => any;
  onRequestClose: () => any;
}

export function PayWithSheetFiatFiat(props: Props & NavigationProps<any>) {
  const api = useApi();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [sendAmount, setSendAmount] = useState(0);

  const [payments, setPayments] = useState<PaymentMeta[] | null>(null);
  const paymentId = useMemo(
    () => getAvailablePayment(props.paymentId, payments),
    [props.paymentId, payments]
  );

  const {
    payment,
    paymentSign,
    currencySign,
    currencyExchangeRate,
    currency
  } = useSelector((state: AppState) => {
    const payment = paymentId ? getPaymentById(state, paymentId) : void 0;
    return {
      currencySign: state.main.localSymbolSign,
      currency: state.main.localSymbolName,
      currencyExchangeRate: state.currency[state.main.symbolId]!,
      payment,
      paymentSign: payment ? payment.sign : ""
    };
  });

  useEffect(() => {
    api
      .fetchSplitPaymentOrders({
        amount: props.receiveAmount,
        paymentId: props.receivePaymentId
      })
      .then(res => {
        const payments = res.data.filter((p: any) => p.orders > 0);
        if (payments.length === 0) {
          util.showAlert(I18n.t("tryAgainMessage"));
          props.onRequestClose();
          return;
        }

        setPayments(res.data.filter((p: any) => p.orders > 0));
      });
  }, [props.amountSAT, currency]);

  const onPaymentUpdate = async () => {
    if (!paymentId || !payments) return;

    setLoading(true);
    try {
      const res = await api.matchSplitOrderFiatFiat(
        props.receiveAmount,
        props.receivePaymentId,
        paymentId
      );

      setSendAmount(+res.send_amount);
      setOrderId(res.order_id);
      setLoading(false);
    } catch (e) {
      util.showAlert(I18n.t("tryAgainMessage"));
      setLoading(false);
      props.onRequestClose();
    }
  };

  useEffect(() => {
    onPaymentUpdate();
  }, [paymentId, props.amountSAT, currencyExchangeRate]);

  const onFiatPress = async () => {
    const { navigation, amountSAT } = props;
    if (!paymentId) return;
    setLoading(true);
    try {
      const orderRes = await api.acceptSplitOrderFiatFiat(
        sendAmount,
        paymentId,
        orderId,
        props.receivePaymentId,
        props.receiveAccount,
        props.receiveAmount
      );
      if (orderRes.code === 0) {
        navigation.navigate("receiveCode", {
          orderId: orderRes.data,
          sendHandle: props.sendHandle,
          amountSAT,
          paymentId
        });
      } else {
        util.showAlert(I18n.t("tryAgainMessage"));
      }
    } catch (e) {
      console.log(e);
      util.showAlert(I18n.t("tryAgainMessage"));
    }
    props.onRequestClose();
  };

  let visibleSign = currencySign;

  if (payment) {
    visibleSign = paymentSign;
  }

  if (!props.visible) {
    return null;
  }

  return (
    <PayWithSheetPure
      header={I18n.t("selectOptionBelow")}
      submitTitle={I18n.t("payUsing", {
        paymentName: payment ? payment.paymentName : ""
      })}
      isLoading={!payments || loading}
      disabled={!paymentId || !payments || payments.length === 0}
      onSubmit={onFiatPress}
      onRequestClose={props.onRequestClose}
      amount={sendAmount}
      sign={visibleSign}
      paymentSelectorProps={{
        optional: true,
        paymentId: paymentId!,
        navigation: props.navigation,
        onChange: ({ paymentId }) => {
          props.navigation.navigate(props.navigation.state.routeName as any);
          dispatch(saveLastUsedPayWithPaymentId(paymentId));
          props.onChange(paymentId);
        },
        onlyPayment: true,
        linkedInfo: "",
        dataSource: async () => payments || []
      }}
    />
  );
}

// FIXME
export default (withNavigation(
  PayWithSheetFiatFiat as any
) as any) as React.ComponentClass<Props>;
