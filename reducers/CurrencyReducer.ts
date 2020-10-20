import { CurrencyAction } from "../actions/CurrencyActions";

export interface CurrencyState {
  [key: number]: number | undefined;
}

const INITIAL_STATE: CurrencyState = {};

export default (
  state: CurrencyState = INITIAL_STATE,
  action: CurrencyAction
): CurrencyState => {
  switch (action.type) {
    case "receive_currency_exchange_rate":
      return {
        ...state,
        ...action.payload
      };
  }

  return state;
};
