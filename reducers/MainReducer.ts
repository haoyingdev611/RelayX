import { MainAction } from "../actions/MainActions";
import find from "lodash/find";

const logos: { [key: number]: any } = {};
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

export interface FavoriteItem {
  paymentId: number;
  name: string;
  // Generally: QR url, for bsv: 1handle, paymail or bsv address
  linkedInfo: string;
}

export interface MainState {
  symbolName: string;
  symbolId: number;
  localSymbolName: string;
  localSymbolSign: string;
  imageUrl: number;
  privateKey: string;
  handle: string;
  pin: string;
  showBalanceFlag: boolean;
  favoriteList: FavoriteItem[];
  localCurrencyFlag?: boolean;
}

const INITIAL_STATE: MainState = {
  symbolName: "",
  symbolId: 10024,
  localSymbolName: "USD",
  localSymbolSign: "",
  imageUrl: require("../icons/america.png"),
  privateKey: "",
  handle: "-",
  pin: "",
  showBalanceFlag: true,
  favoriteList: [],
  localCurrencyFlag: false
};

export default (
  state: MainState = INITIAL_STATE,
  action: MainAction
): MainState => {
  switch (action.type) {
    
    case "receive_currency_settings": {
      const obj = action.payload;
      let symbolName = obj.localSymbolName;
      if (obj.localSymbolId === 7) {
        symbolName = "SAT";
      }
      return {
        ...state,
        symbolName: symbolName,
        symbolId: obj.localSymbolId,
        localSymbolName: obj.localSymbolName,
        localSymbolSign: obj.localSymbolSign,
        imageUrl: logos[obj.localSymbolId]
      };
    }

    case "get_handle_pin": {
      return {
        ...state,
        handle: action.payload.handle,
        pin: action.payload.pin
      };
    }
    case "balance_flag": {
      return { ...state, showBalanceFlag: action.payload };
    }
    case "toggle_favorite": {
      const { paymentId, linkedInfo } = action.payload;
      const favoriteList = Array.isArray(state.favoriteList)
        ? state.favoriteList
        : [];
      const exists = find(
        favoriteList,
        item => item.linkedInfo === linkedInfo && item.paymentId === paymentId
      );
      if (exists) {
        const newList: FavoriteItem[] = [];
        favoriteList.map(item => {
          if (
            !(item.linkedInfo === linkedInfo && item.paymentId === paymentId)
          ) {
            newList.push(item);
          }
        });
        return {
          ...state,
          favoriteList: newList
        };
      } else {
        return {
          ...state,
          favoriteList: [...favoriteList, action.payload]
        };
      }
    }
    case "update_favorite": {
      const { paymentId, linkedInfo } = action.payload;
      const favoriteList = Array.isArray(state.favoriteList)
        ? state.favoriteList
        : [];
      const index = favoriteList.findIndex(
        item => item.linkedInfo === linkedInfo && item.paymentId === paymentId
      );
      if (~index) {
        const newList: FavoriteItem[] = [...favoriteList];
        newList[index] = action.payload;
        return {
          ...state,
          favoriteList: newList
        };
      } else {
        return {
          ...state,
          favoriteList: [...favoriteList, action.payload]
        };
      }
    }
    default:
      return state;
  }
};
