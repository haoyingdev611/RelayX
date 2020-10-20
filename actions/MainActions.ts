import { Action } from "./types";
import { CurrencySetting, useApi } from "../src/api";
import { useDispatch } from "../src/types";
import { FavoriteItem, MainState } from "../reducers/MainReducer";

export type SetBalanceFlagAction = Action<"balance_flag", boolean>;
export function onSetBalanceFlag(payload: boolean): SetBalanceFlagAction {
  return {
    type: "balance_flag",
    payload
  };
}

export type GetHandlePinAction = Action<
  "get_handle_pin",
  {
    handle: string;
    pin: string;
  }
>;
export function getHandlePinAction(payload: {
  handle: string;
  pin: string;
}): GetHandlePinAction {
  return {
    type: "get_handle_pin",
    payload
  };
}

// 获取用户handle
export function useOnUserInfo() {
  const api = useApi();
  const dispatch = useDispatch();
  return async (address: string) => {
    try {
      const data = await api.fetchUserInfo(address.toString());
      // console.log(data);
      if (data.code === 0) {
        dispatch(
          getHandlePinAction({
            handle: data.data.handleName || "",
            pin: data.data.pin || ""
          })
        );
      }
    } catch (e) {
      // console.error(e);
    }
  };
}

export type ReceiveCurrencySettingAction = Action<
  "receive_currency_settings",
  CurrencySetting
>;
export function receiveCurrencySettingsAction(
  payload: CurrencySetting
): ReceiveCurrencySettingAction {
  return {
    type: "receive_currency_settings",
    payload
  };
}

// 获取当前currency
export function useGetCurrencySettings() {
  const api = useApi();
  const dispatch = useDispatch();
  return async () => {
    try {
      const data = await api.fetchCurrencySetting();

      if (data.code === 0) {
        dispatch(receiveCurrencySettingsAction(data.data));
      }
    } catch (e) {
      // console.error(e);
    }
  };
}

export type OnToggleFavoriteAction = Action<"toggle_favorite", FavoriteItem>;

export const onToggleFavorite = (
  data: FavoriteItem
): OnToggleFavoriteAction => {
  return {
    type: "toggle_favorite",
    payload: data
  };
};

export type OnUpdateFavoriteAction = Action<"update_favorite", FavoriteItem>;

export const onUpdateFavorite = (
  data: FavoriteItem
): OnUpdateFavoriteAction => {
  return {
    type: "update_favorite",
    payload: data
  };
};

// All basic actions
export type MainAction =
  | SetBalanceFlagAction
  | GetHandlePinAction
  | ReceiveCurrencySettingAction
  | OnToggleFavoriteAction
  | OnUpdateFavoriteAction;
