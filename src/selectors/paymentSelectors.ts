import { AppState } from "../../reducers/index";
import { PaymentMeta } from "../../src/api";
import { isInstantExchange, EPHEMERAL_PAYMENTS } from "../payments";

export function getPaymentById(
  state: AppState,
  paymentId: number
): PaymentMeta {
  if (isInstantExchange(paymentId)) {
    return EPHEMERAL_PAYMENTS.find(item => item.paymentId === paymentId)!;
  }
  const payment = state.settingReducer.receiveList.find(
    p => p.paymentId === paymentId
  );

  if (!payment) {
    throw new Error("Payment resolution error");
  }

  return payment;
}
