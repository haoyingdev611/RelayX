// @flow
export * from "./MainActions";
export * from "./TransactionsActions";
export * from "./SettingActions";
export * from "./WalletActions";

import { MainAction } from "./MainActions";
import { TransactionAction } from "./TransactionsActions";
import { SettingAction } from "./SettingActions";
import { OrdersAction } from "./OrdersActions";
import { WalletAction } from "./WalletActions";
import { CurrencyAction } from "./CurrencyActions";
import { UIStateAction } from "./UIStateActions";
import { MnemonicGraveyardAction } from "./MnemonicGraveyardActions";

export type Action =
  | MainAction
  | TransactionAction
  | SettingAction
  | OrdersAction
  | WalletAction
  | CurrencyAction
  | UIStateAction
  | MnemonicGraveyardAction;
