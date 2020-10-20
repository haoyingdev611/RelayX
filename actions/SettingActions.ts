import { Action } from "./types";
import { CurrencyMeta, PaymentMeta, useApi } from "../src/api";
import { useDispatch } from "../src/types";
import { receiveCurrencySettingsAction } from "./MainActions";

type GotoPageAction = Action<"goto_page", string>;
export const onGotoPage = (text: string): GotoPageAction => {
  return {
    type: "goto_page",
    payload: text
  };
};

type SetLanguage = Action<"set_language", string>;
export const onChangeLanguage = (language: string): SetLanguage => {
  return {
    type: "set_language",
    payload: language
  };
};

type CurrencyListPayload = {
  list: CurrencyMeta[];
  currencyLoading: boolean;
};

type CurrencyListAction = Action<"currency_list", CurrencyListPayload>;
function currencyListAction(payload: CurrencyListPayload): CurrencyListAction {
  return {
    type: "currency_list",
    payload
  };
}

// 可设置的币种列表
export function useOnSettingCurrencyList() {
  const api = useApi();
  const dispatch = useDispatch();
  return async (symbolType: number) => {
    try {
      const data = await api.fetchCurrencyList(symbolType);

      if (data.code === 0) {
        dispatch(
          currencyListAction({
            list: data.data || [],
            currencyLoading: false
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };
}

type PaymentListAction = Action<"payment_list", PaymentMeta[]>;
function paymentList(payload: PaymentMeta[]): PaymentListAction {
  return {
    type: "payment_list",
    payload
  };
}

// 获取充值支付方式
export function useOnSettingPayment() {
  const api = useApi();
  const dispatch = useDispatch();

  return async () => {
    try {
      const data = await api.fetchPaymentList();
      if (data.code === 0) {
        dispatch(paymentList(data.data || []));
      }
    } catch (e) {
      console.error(e);
    }
  };
}

export type UpdateCurrencyPayload = {
  localSymbolId: number;
};

export function useUpdateCurrency() {
  const api = useApi();
  const dispatch = useDispatch();
  return async (payload: UpdateCurrencyPayload) => {
    try {
      const res = await api.fetchCurrencyUpdate(payload);

      if (res.code === 0) {
        dispatch(receiveCurrencySettingsAction(res.data));
      }
    } catch (e) {
      console.log(e);
    }
  };
}

type ReceiveConfigAction = Action<"receive_config", { node: string }>;
function receiveConfig(payload: { node: string }): ReceiveConfigAction {
  return {
    type: "receive_config",
    payload
  };
}

export function useLoadConfig() {
  const api = useApi();
  const dispatch = useDispatch();
  return async () => {
    const data = await api.settingNode();
    dispatch(receiveConfig({ node: data.data }));
  };
}

type SaveApiKeyAction = Action<"save_api_key", string>;
export function saveApiKey(payload: string): SaveApiKeyAction {
  return {
    type: "save_api_key",
    payload
  };
}

type SaveLastUsedPayWithPaymentIdAction = Action<
  "save_last_used_pay_with_payment_id",
  number
>;
export function saveLastUsedPayWithPaymentId(
  payload: number
): SaveLastUsedPayWithPaymentIdAction {
  return {
    type: "save_last_used_pay_with_payment_id",
    payload
  };
}

export type SettingAction =
  | GotoPageAction
  | SetLanguage
  | CurrencyListAction
  | PaymentListAction
  | SaveApiKeyAction
  | ReceiveConfigAction
  | SaveLastUsedPayWithPaymentIdAction;
