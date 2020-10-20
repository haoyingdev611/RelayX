import { combineReducers } from "redux";
import MainReducer, { MainState } from "./MainReducer";
import TransactionsReducer, { TransactionsState } from "./TransactionsReducer";
import SettingReducer, { SettingState } from "./SettingReducer";
import OrdersReducer, { OrdersState } from "./OrdersReducer";
import WalletReducer, { WalletState } from "./WalletReducer";
import CurrencyReducer, { CurrencyState } from "./CurrencyReducer";
import UIStateReducer, { UIState } from "./UIStateReducer";
import MnemonicGraveyardReducer, {
  MnemonicGraveyardState
} from "./mnemonicGraveyardReducer";

export default combineReducers<State, any>({
  main: MainReducer,
  transactionsReducer: TransactionsReducer,
  settingReducer: SettingReducer,
  orders: OrdersReducer,
  wallet: WalletReducer,
  currency: CurrencyReducer,
  ui: UIStateReducer,
  mnemonicGraveyard: MnemonicGraveyardReducer
});

export type State = {
  main: MainState;
  transactionsReducer: TransactionsState;
  settingReducer: SettingState;
  orders: OrdersState;
  wallet: WalletState;
  currency: CurrencyState;
  ui: UIState;
  mnemonicGraveyard: MnemonicGraveyardState;
};

export type AppState = State;
