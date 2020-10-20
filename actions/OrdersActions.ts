import { Action } from "./types";
import { useDispatch } from "../src/types";
import { useApi } from "../src/api";
import { AppState } from "../reducers";
import { useSelector } from "react-redux";

// export type SpotChargeAction = Action<"spot_charge", SpotCharge>;

export type HideReceiveModalAction = Action<"ORDERS_HIDE_RECEIVE_MODAL", null>;
export function hideReceiveModal(): HideReceiveModalAction {
  return {
    type: "ORDERS_HIDE_RECEIVE_MODAL",
    payload: null
  };
}

export function useOnReceived() {
  const api = useApi();
  const dispatch = useDispatch();
  return async (orderId: string) => {
    try {
      const res = await api.sendOrderReceive(orderId);
      console.log("RESULT:", res);
      dispatch(hideReceiveModal());
    } catch (e) {
      console.log(e);
    }
  };
}

// Not Received Withdraw order request
export function useOnNotReceived() {
  const api = useApi();
  const dispatch = useDispatch();
  return async (orderId: string) => {
    try {
      const res = api.sendOrderClose(orderId);
      console.log("RESULT:", res);
      dispatch(hideReceiveModal());
    } catch (e) {
      console.log(e);
    }
  };
}
// FIXME
type OrdersUpdateOrderAction = Action<"ORDERS_UPDATE_ORDER", any>;
export function ordersUpdateOrder(payload: any): OrdersUpdateOrderAction {
  return {
    type: "ORDERS_UPDATE_ORDER",
    payload
  };
}

export function useCheckOrderReceive() {
  const api = useApi();
  const dispatch = useDispatch();
  const orders = useSelector((state: AppState) => state.orders);
  return async (orderId: string) => {
    try {
      if (!orderId) {
        return;
      }

      if (orders.showModalForOrder) {
        return;
      }
      if (
        orders.index[orderId] &&
        (orders.index[orderId].status === 10000 ||
          orders.index[orderId].status === -200)
      ) {
        return;
      }

      const res = await api.earnGetDetail(orderId, 1);
      console.log("Check withdraw status again", res);
      if (res.code === 0) {
        const { data } = res;
        dispatch(ordersUpdateOrder(data));
      }
    } catch (err) {
      console.log(err);
    }
  };
}

export type OrdersAction = HideReceiveModalAction | OrdersUpdateOrderAction;
