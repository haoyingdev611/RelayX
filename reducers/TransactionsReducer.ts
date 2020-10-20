import sortBy from "lodash/sortBy";
import map from "lodash/map";
import each from "lodash/each";
import { TransactionAction } from "../actions/TransactionsActions";
import { Transaction } from "../src/api";

import { TransactionStatus, getTransactionStatus } from "../src/constants";

export type TransactionItem = Transaction & { statusLabel: string };

export type TransactionsState = {
  transactions: TransactionItem[];
  currentPage: number;
  totalPage: number;
  transactionLoading: boolean;
};

const INITIAL_STATE = {
  transactions: [],
  currentPage: 1,
  totalPage: 1,
  transactionLoading: true
};

export default (
  state: TransactionsState = INITIAL_STATE,
  action: TransactionAction
): TransactionsState => {
  switch (action.type) {
    case "transactions_list": {
      const { transactionLoading } = action.payload;
      const list = map(action.payload.list, item => ({
        ...item,
        statusLabel: getTransactionStatus(
          item.tranType,
          item.status,
          item.tranType === 1
        )
      }));

      const waitingList: TransactionItem[] = [],
        others: TransactionItem[] = [];

      each(list, item => {
        switch (item.statusLabel) {
          case TransactionStatus.waitingConfirm:
            waitingList.push(item);
            break;
          default:
            others.push(item);
            break;
        }
      });

      const transactions = [
        ...sortBy(waitingList, [{ createdDate: "desc" }]),
        ...sortBy(others, [{ createdDate: "desc" }])
      ];

      return {
        ...state,
        transactions,
        transactionLoading: transactionLoading
      };
    }
    default:
      return state;
  }
};
