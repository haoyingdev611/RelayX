import { Dispatch as ReduxDispatch, Store as ReduxStore } from "redux";
import {
  connect as reduxConnect,
  MapStateToPropsParam,
  InferableComponentEnhancerWithProps,
  useDispatch as reduxDispatch
} from "react-redux";
import { Action } from "../actions";
import { State } from "../reducers";
import { PaymentMeta, ScanData, VerifyResult } from "../src/api";

export type Store = ReduxStore<State, Action>;
export type GetState = () => State;
export type Dispatch = ReduxDispatch<Action>;

export type DispatchProps = {
  dispatch: Dispatch;
};

export type NavigationEventListener = {
  remove: () => void;
};

type OnlyPaymentCallback = (item: PaymentMeta) => boolean;

declare class Navigation<T> {
  navigate(
    routeName: "selectPaymentMethod",
    args: {
      onSelect: (args: { paymentId: number; linkedInfo: string }) => void;
      selected: number;
      onlyPayment: boolean | OnlyPaymentCallback;
      dataSource?: () => Promise<PaymentMeta[]>;
      filter?: (item: PaymentMeta) => boolean;
      itemSubTitle?: (item: PaymentMeta) => string;
    }
  ): void;
  push(
    routeName: "selectPaymentMethod",
    args: {
      onSelect: (args: { paymentId: number; linkedInfo: string }) => void;
      selected: number;
      onlyPayment: boolean | OnlyPaymentCallback;
      dataSource?: () => Promise<PaymentMeta[]>;
      filter?: (item: PaymentMeta) => boolean;
      itemSubTitle?: (item: PaymentMeta) => string;
    }
  ): void;
  navigate(routeName: "send"): void;
  navigate(routeName: "settingsNavigator"): void;
  navigate(
    routeName: "sendSecond",
    args: {
      paymentId: number;
      handle: string;
      handleAddress: string;
      amount?: number;
    }
  ): void;
  navigate(
    routeName: "sendFiat",
    args: {
      amountInFiat?: number;
      paymentId: number;
      linkedInfo: string;
      route?: string;
    }
  ): void;
  navigate(
    routeName: "channelSelect",
    args: {
      scanType: string;
      uri: string;
    }
  ): void;
  navigate(
    routeName: "upload",
    args: {
      paymentId: number;
      onSuccess: (args: { paymentId: number; linkedInfo: string }) => void;
    }
  ): void;
  navigate(
    routeName: "relayDetail",
    args: {
      direction: "toRelayOne" | "fromRelayOne";
      orderNumber?: string;
      currencySign: string;
      amountLocal: number;
      txHash: string;
    }
  ): void;
  navigate(routeName: "onboarding"): void;
  navigate(routeName: "start"): void;
  navigate(routeName: "localCurrency"): void;
  navigate(routeName: "relayOneSync", args: { sync?: boolean }): void;
  navigate(routeName: "backup"): void;
  navigate(
    routeName: "restore",
    args: { handle: string; address?: string }
  ): void;
  navigate(routeName: "restoreSuccess"): void;
  navigate(routeName: "inviteFriend"): void;
  navigate(routeName: "scan"): void;
  navigate(routeName: "settings"): void;
  navigate(routeName: "relayWithdraw"): void;
  navigate(routeName: "relayOne"): void;
  navigate(routeName: "relayOneAuth", args: { qrCode: string }): void;
  navigate(
    routeName: "expiredPage",
    args: {
      linkedInfo: string;
      paymentId: number;
      walletSendAmount: any;
    }
  ): void;
  navigate(
    routeName: "receiveCode",
    args: {
      orderId: string;
      amountSAT: number;
      paymentId: number;
      sendHandle?: string;
    }
  ): void;
  navigate(
    routeName: "transactionDetail",
    args: { orderId: string; tranType: number; autoClose?: boolean }
  ): void;
  navigate(
    routeName: "sendSuccess",
    args: {
      amount: number;
      amountSAT: number;
      handle: string;
      inputMode: number;
    }
  ): void;
  navigate(routeName: "webContainer", args: { txId?: string }): void;
  navigate(routeName: "sendToExchange"): void;
  // FIXME
  replace(route: any, params?: any): void;
  pop(): void;
  goBack: (from?: string | null) => void;
  state: {
    index: number;
    params: T;
    routeName: string;
  };
  addListener(event: string, callback: any): NavigationEventListener;
  setParams(params: any): void;
  // DO NOT implement getParam, use direct access instead, as its gonna be typed
}

export type NavigationProps<T = void> = {
  navigation: Navigation<T>;
};

export const useDispatch: () => Dispatch = reduxDispatch;

export const connect: <
  TStateProps = {},
  _no_dispatch = {}, // eslint-disable-line @typescript-eslint/camelcase
  TOwnProps = {},
  State = {}
>(
  mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>
) => InferableComponentEnhancerWithProps<
  TStateProps & DispatchProps,
  TOwnProps
> = reduxConnect;
