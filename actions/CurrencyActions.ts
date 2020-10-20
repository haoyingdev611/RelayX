import { Action } from "./types";
import { useDispatch } from "../src/types";
import { useApi } from "../src/api";

export type ReceiveCurrencyExchangeRateAction = Action<
  "receive_currency_exchange_rate",
  { [symbolId: number]: number }
>;
export function receiveCurrencyExchangeRateAction(payload: {
  [symbolId: number]: number;
}): ReceiveCurrencyExchangeRateAction {
  return {
    type: "receive_currency_exchange_rate",
    payload
  };
}

//get exchange rate for a currency
export const useUpdateExchangeRates = () => {
  const api = useApi();
  const dispatch = useDispatch();
  return async () => {
    try {
      const rates = await api.fetchCurrencyRates();

      const result: { [symbolId: number]: number } = {};

      rates.data.forEach(data => {
        result[data.baseSymbolId] = data.exchangeRate;
      });

      dispatch(receiveCurrencyExchangeRateAction(result));
    } catch (e) {
      console.error(e);
    }
  };
};
export type CurrencyAction = ReceiveCurrencyExchangeRateAction;
