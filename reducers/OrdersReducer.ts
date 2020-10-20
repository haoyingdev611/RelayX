import { OrdersAction } from "../actions/OrdersActions";

type OrderDetails = {
  serialNumber: string;
  status: number;
};

export type OrdersState = {
  index: { [key: string]: OrderDetails };
  showModalForOrder: string;
};

const INITIAL_STATE: OrdersState = {
  index: {},
  showModalForOrder: ""
};

export default (
  state: OrdersState = INITIAL_STATE,
  action: OrdersAction
): OrdersState => {
  switch (action.type) {
    case "ORDERS_UPDATE_ORDER":
      const data = action.payload;
      const newState = {
        ...state,
        index: { ...state.index, [data.serialNumber]: data }
      };
      if (data.status === 200 && !state.showModalForOrder) {
        return { ...newState, showModalForOrder: data.serialNumber };
      }
      return newState;
    case "ORDERS_HIDE_RECEIVE_MODAL":
      // FIXME: check other orders
      return { ...state, showModalForOrder: "" };
    default:
      return state;
  }
};
