import React from "react";
import Input from "../../src/components/Input";
import { useSelector } from "react-redux";
import { AppState } from "../../reducers";
import { getPaymentById } from "../../src/selectors/paymentSelectors";
import styled from "styled-components/native";

const Wrapper = styled.View`
  margin-top: 20px;
`;

interface Props {
  paymentId: number;
  linkedInfo: string;
  onChange(linkedInfo: string): void;
}

export default function ExchangeAccountEditor(props: Props) {
  const payment = useSelector((state: AppState) => {
    return getPaymentById(state, props.paymentId);
  });
  return (
    <Wrapper>
      <Input
        placeholder={`${payment.paymentName} account Phone number or Email`}
        value={props.linkedInfo}
        onChange={props.onChange}
      />
    </Wrapper>
  );
}
