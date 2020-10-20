import { PaymentMeta } from "../src/api";

export function isInstantExchange(paymentId: number) {
  return paymentId > 10000000;
}

export function getInstantExchangeId(paymentId: number) {
  return paymentId === 10000001 ? 153 : 3;
}

// Only exist on frontend
export const EPHEMERAL_PAYMENTS: PaymentMeta[] = [
  {
    paymentId: 10000001,
    paymentName: "FloatSV",
    paymentType: 2,
    sign: "₿",
    status: 1,
    symbolId: 7,
    symbolName: "BSV"
  },
  {
    paymentId: 10000002,
    paymentName: "OKEx",
    paymentType: 2,
    sign: "₿",
    status: 1,
    symbolId: 7,
    symbolName: "BSV"
  }
];
