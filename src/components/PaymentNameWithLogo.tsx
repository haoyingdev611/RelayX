import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import styled from "styled-components/native";

import I18n from "../locales";
import { PaymentMeta } from "../../src/api";
import { AppState } from "../../reducers";
import { PayWallet, Colors } from "../constants";
import { getPaymentById } from "./../selectors/paymentSelectors";
import { useSelector } from "react-redux";
import { isInstantExchange } from "../payments";

interface OwnProps {
  paymentId: number;
  linkedInfo?: string;
  disabled?: boolean;
  size?: number;
}

interface LogoProps {
  size?: number;
  disabled?: boolean;
}

const Logo = styled.Image`
  width: ${(props: LogoProps) => props.size || 34}px;
  height: ${(props: LogoProps) => props.size || 34}px;
  border-radius: ${(props: LogoProps) => (props.size || 34) / 2}px;
  margin-right: 10px;
  opacity: ${(props: LogoProps) => (props.disabled ? 0.3 : 1)};
`;

function getPayLogo(payment: PaymentMeta, linkedInfo?: string) {
  if (payment.paymentId === 1) {
    const payMark = linkedInfo || "";
    const res = {
      image: require("../../icons/methods/bsv.png"),
      title: "BSV",
      name: payMark || "BSV"
    };
    if (payMark.substring(0, 1) === "$" || payMark.endsWith("@handcash.io")) {
      res.image = require("../../icons/methods/handcash.png");
      res.title = "Handcash";
      res.name = payMark;
    } else if (payMark.endsWith("@moneybutton.com")) {
      res.image = require("../../icons/methods/moneybutton.png");
      res.title = "Moneybutton";
      res.name = payMark;
    } else if (payMark.endsWith("@simply.cash")) {
      res.image = require("../../icons/methods/sc.png");
      res.title = "SimplyCash";
      res.name = payMark;
    } else if (payMark.substring(0, 1) === "1" && payMark.length < 25) {
      res.image = require("../../icons/methods/relay.png");
      res.title = "Relay";
      res.name = payMark;
    } else if (payMark.startsWith("float:")) {
      res.image = require("../../icons/methods/floatsv.png");
      res.title = "FloatSV";
      res.name = payMark.replace("float:", "");
    } else if (payMark.startsWith("okex:")) {
      res.image = require("../../icons/methods/okex.png");
      res.title = "OKEx";
      res.name = payMark.replace("okex:", "");
    } else if (payMark.endsWith("@DemoFav")) {
      res.image = require("../../icons/methods/demo-fav.png");
      res.title = "DemoFav";
      res.name = payMark.replace("DemoFav:", "");
    }

    return res;
  } else if (isInstantExchange(payment.paymentId)) {
    return {
      title: I18n.t(payment.paymentName, {
        defaultValue: payment.paymentName
      }),
      image: PayWallet[payment.paymentName],
      name: linkedInfo || payment.paymentName || ""
    };
  } else {
    return {
      title: I18n.t(payment.paymentName, {
        defaultValue: payment.paymentName
      }),
      image: PayWallet[payment.paymentName],
      name: I18n.t(payment.paymentName, {
        defaultValue: payment.paymentName
      })
    };
  }
}

export function PaymentLogo(props: OwnProps) {
  const { paymentId, linkedInfo, ...restProps } = props;
  const payment = useSelector((state: AppState) =>
    getPaymentById(state, paymentId)
  );
  const paymentDisplay = getPayLogo(payment, linkedInfo);

  return (
    <Logo resizeMode="contain" source={paymentDisplay.image} {...restProps} />
  );
}

export function PaymentDestinationName(
  props: OwnProps & { style?: StyleProp<TextStyle> }
) {
  const [payment, fav] = useSelector((state: AppState) => [
    getPaymentById(state, props.paymentId),
    state.main.favoriteList.find(
      f => f.linkedInfo === props.linkedInfo && f.paymentId === props.paymentId
    )
  ]);
  const paymentDisplay = getPayLogo(payment, props.linkedInfo);

  // FIXME
  if (props.disabled) {
    return (
      <Text style={[props.style, { color: Colors.LightGrey }].filter(Boolean)}>
        {fav ? fav.name : paymentDisplay.name}
      </Text>
    );
  }

  return (
    <Text style={[props.style, { marginLeft: 10 }]}>
      {fav ? fav.name : paymentDisplay.name}
    </Text>
  );
}

export function ReadableLinkedInfo(
  props: OwnProps & { style?: StyleProp<TextStyle> }
) {
  const payment = useSelector((state: AppState) =>
    getPaymentById(state, props.paymentId)
  );
  const paymentDisplay = getPayLogo(payment, props.linkedInfo);

  return <Text style={props.style}>{paymentDisplay.name}</Text>;
}

export function PaymentNameWithLogo(
  props: OwnProps & { textStyle?: StyleProp<TextStyle> }
) {
  const { paymentId, linkedInfo, ...restProps } = props;

  return (
    <>
      <PaymentLogo
        paymentId={paymentId}
        linkedInfo={linkedInfo}
        disabled={props.disabled}
        {...restProps}
      />
      <PaymentDestinationName
        paymentId={props.paymentId}
        linkedInfo={props.linkedInfo}
        disabled={props.disabled}
        style={props.textStyle}
      />
    </>
  );
}
