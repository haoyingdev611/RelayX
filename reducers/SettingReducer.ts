import isEqual from "lodash/isEqual";
import { SettingAction } from "../actions/SettingActions";
import { PaymentMeta } from "../src/api";

const logos: { [key: number]: number } = {};
logos[7] = require("../icons/methods/bsv.png");
logos[10004] = require("../icons/european-union.png");
logos[10007] = require("../icons/argentina.png");
logos[10009] = require("../icons/australia.png");
logos[10024] = require("../icons/america.png");
logos[10030] = require("../icons/canada.png");
logos[10034] = require("../icons/china.png");
logos[10059] = require("../icons/hong-kong.png");
logos[10063] = require("../icons/indonesia.png");
logos[10068] = require("../icons/japan.png");
logos[10073] = require("../icons/south-korea.png");
logos[10111] = require("../icons/philippines.png");
logos[10137] = require("../icons/thailand.png");
logos[10146] = require("../icons/united-kingdom.png");

export interface CurrencyListItem {
  imageUrl: number;
  symbol: string;
  symbolId: number;
}

export type SettingState = {
  currencyList: CurrencyListItem[];
  currencyLoading: boolean;
  receiveList: PaymentMeta[];
  language: string;
  node: string;
  apiKey?: string;
  lastUsedPayWithPaymentId?: number;
};

const INITIAL_STATE: SettingState = {
  currencyList: [],
  currencyLoading: true,
  receiveList: [],
  language: "en",
  node: "",
  apiKey: ""
};

export default (
  state: SettingState = INITIAL_STATE,
  action: SettingAction
): SettingState => {
  switch (action.type) {
    case "currency_list":
      const obj = action.payload;
      const coins: CurrencyListItem[] = [];
      obj.list.forEach(item => {
        coins.push({
          imageUrl: logos[item.symbolId],
          symbol: item.symbol,
          symbolId: item.symbolId
        });
      });

      if (isEqual(coins, state.currencyList)) {
        return state;
      }

      return {
        ...state,
        currencyList: coins,
        currencyLoading: obj.currencyLoading
      };
    case "set_language": {
      return { ...state, language: action.payload };
    }
    case "payment_list": {
      if (isEqual(action.payload, state.receiveList)) {
        return state;
      }
      const list = [
        {
          paymentId: 1,
          paymentName: "BSV",
          paymentType: 2,
          sign: "₿",
          status: 1,
          symbolId: 7,
          symbolName: "BSV"
        }
      ];
      action.payload.length > 0 &&
        action.payload.forEach(item => {
          list.push({
            paymentId: item.paymentId,
            paymentName: item.paymentName,
            paymentType: item.paymentType,
            sign: item.sign,
            status: item.status,
            symbolId: item.symbolId,
            symbolName: item.symbolName
          });
        });
      return { ...state, receiveList: list };
    }

    case "receive_config":
      return { ...state, node: action.payload.node };
    case "save_api_key":
      return { ...state, apiKey: action.payload };
    case "save_last_used_pay_with_payment_id":
      return { ...state, lastUsedPayWithPaymentId: action.payload };

    default: {
      return state;
    }
  }
};
