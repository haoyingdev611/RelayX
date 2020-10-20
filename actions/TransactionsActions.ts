import { Transaction, PageInfo, useApi } from "../src/api";
import { Action } from "./types";
import { useDispatch } from "../src/types";

type TransactionListPayload = {
  list: Transaction[];
  hasNextPage: boolean;
  pageInfo: PageInfo;
  transactionLoading: boolean;
};

type TransactionListAction = Action<
  "transactions_list",
  TransactionListPayload
>;
function transactionListAction(
  payload: TransactionListPayload
): TransactionListAction {
  return {
    type: "transactions_list",
    payload
  };
}

// transaction订单列表
export function useOnTransactionsList() {
  const api = useApi();
  const dispatch = useDispatch();
  return async () => {
    try {
      const data = await api.fetchTransactionList();
      if (data.code === 0) {
        dispatch(
          transactionListAction({
            list: data.data.list,
            hasNextPage: data.data.hasNextPage,
            pageInfo: data.data.pageInfo,
            transactionLoading: false
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export type TransactionAction = TransactionListAction;
