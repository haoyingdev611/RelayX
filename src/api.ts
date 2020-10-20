import { NET_URL } from "../actions/types";
import util from "../utils/util";

export type EarnListParams = {
  payMode?: number;
  status: number;
  tranType: number;
};

type ServerResponse<T> = {
  code: number;
  data: T;
};

export type PageInfo = {
  pageSize: number;
  sortItem?: string;
  sortType?: string;
  startIndex: number;
  totals: number;
};

type ListResponse<T> = {
  hasNextPage: boolean;
  list: T[];
  pageInfo: PageInfo;
};

export type EarnOrderDetails = {
  bsvReceiveAmount: number;
  paymentId: number;
  expireTime: number;
  serialNumber: string;
  walletEarnAmount: number;
  walletRate: number;
  walletSendAmount: number;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
};

type FinanceBalance = {
  balance: number;
  satoshi: number;
  symbolId: number;
  symbolName: string;
  unconfirmedBalance: number;
  unconfirmedSatoshi: number;
};

type UserInfo = {
  handleName?: string;
  pin?: string;
};

export type CurrencyRate = {
  baseSymbolId: number;
  exchangeRate: number;
  networkFee: number;
  quoteSymbolId: number;
  relayFee: number;
};

export type CreateOrderParams = {
  type: 1;
  payMark: string;
  amount: number;
  symbolId: number;
  localAmount: number;
  localSymbolId: number;
  localSymbolName: string;
  txid: string;
};

export type CurrencySetting = {
  linkedAccountId: number;
  linkedInfo: string;
  linkedName: string;
  linkedSign: string;
  linkedStatus: number;
  linkedSymbolId: number;
  linkedSymbolName: string;
  localSymbolId: number;
  localSymbolName: string;
  localSymbolSign: string;
};

export type CurrencyMeta = {
  sign: string;
  symbol: string;
  symbolFullName: string;
  symbolId: number;
};

export type PaymentMeta = {
  paymentId: number;
  paymentName: string;
  sign: string;
  status: number;
  symbolId: number;
  symbolName: string;
  paymentType: number;
};

export interface VerifyResult {
  paymentId: number;
  paymentName: string;
  sign: string;
  status: number;
  symbolId: number;
  symbolName: string;
  paymentType: number;
  qrCode: string;
  handle: string;
  amount?: number;
}

export interface ScanData {
  qrCode: string;
  paymentId: number;
  amount?: number;
  handle: string;
  status: number;
}

export type PaymentOrderCountMeta = PaymentMeta & {
  orders: number;
};

interface CreateSendOrderPayload {
  bsvAmount: number;
  jsonInfo: string;
  payModeId: number;
  orderNumber: string;
  walletRate: number;
  walletSendAmount: number;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
  localFeePer: number;
  feeType: number;
  relayFeePer: number;
  txid: string;
}

interface CreateSendOrderResponse {
  completeDate: string;
  completeTime: string;
  createdDate: string;
  createdTime: string;
  disputeImg: string;
  expireTime: number;
  feeDesc: string;
  fundAddress: string;
  jsonInfo: string;
  operateType: number;
  payMode: number;
  payModeName: string;
  paymentType: number;
  receiveInfo: string;
  serialNumber: string;
  status: number;
  statusInfo: string;
  tranFrom: number;
  tranType: number;
  txid: string;
  type: number;
  walletEarnAmount: number;
  walletRate: number;
  walletRechargeAmount: number;
  walletSendAmount: number;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
}

interface MatchSplitOrderResponse {
  order_id: string;
  receive_amount: string;
  send_amount: string;
  tranFrom: number;
  walletRate: string;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
}

interface SplitOrderPreResponse {
  bsvAmountLimitMax: string;
  bsvAmountLimitMin: string;
  feeFixAmountLimitMax: number;
  feeFixAmountLimitMin: number;
  feeMinAmountLimitMax: number;
  feeMinAmountLimitMin: number;
  feePCTLimitMax: number;
  feePCTLimitMin: number;
  walletAmountMaxLimit: number;
}

interface SplitOrderSelectionResponse {
  completeDate: string;
  completeTime: string;
  createdDate: string;
  createdTime: string;
  disputeImg: string;
  expireTime: number;
  feeDesc: string;
  fundAddress: string;
  jsonInfo: string;
  operateType: number;
  payMode: number;
  payModeName: string;
  paymentType: number;
  receiveInfo: string;
  serialNumber: string;
  status: number;
  statusInfo: string;
  tranFrom: number;
  tranType: number;
  txid: string;
  type: number;
  walletEarnAmount: number;
  walletRate: number;
  walletRechargeAmount: number;
  walletSendAmount: number;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
}

export type Transaction = {
  createdDate: string;
  localAmount: number;
  localSymbolName: string;
  localSymbolSign: string;
  networkFee: number;
  payMark: string;
  payMode: number;
  relayFee: number;
  serialNumber: string;
  status: number;
  tranType: number;
  tranFrom: number;
  txid: string;
};

export type NotificationSettings = {
  basic: 1 | -1;
  advanced: 1 | -1;
  info?: {
    advancedInfoList: {
      orderRangeMax: number;
      orderRangeMin: number;
      symbolId: number;
      type: number;
      // FIXME maybe wrong
      paymentList: PaymentMeta[];
    }[];
  };
};

export interface PaymentOrdersConfig {
  feePre: number;
  feeType: number;
  maxAmount: number;
  maxFeePre: number;
  minAmount: number;
  minFeePre: number;
  relayFeePre: number;
}
interface HaveSplitOrderResponse {
  sign: string;
  walletMaxSplitAmount: number;
  walletMinSplitAmount: number;
}

export interface SplitOrderListDetails {
  bsvAvailAmount: number;
  feeAmount: number;
  feePer: number;
  orderId: string;
  status: number;
  walletAvailAmount: number;
  walletLogoURL: string;
  walletMaxSplitAmount: number;
  walletMinSplitAmount: number;
  walletPaymentId: number;
  walletPaymentName: string;
  walletSymbolId: number;
  walletSymbolName: string;
  walletSymbolSign: string;
}

export interface SplitLimitInfo {
  paymentId: number;
  sign: string;
  walletMaxSplitAmount: number;
  walletMaxSplitReceiveAmount: number;
  walletMaxSplitSendAmount: number;
  walletMinSplitAmount: number;
}

export interface PaymentsVerifyParams {
  qrInfo: string;
  paymentId?: number;
}

let _apiKey = "";

export function setApiKey(key: string) {
  _apiKey = key;
}

function getApiKey() {
  return _apiKey;
}

export function useApi() {
  async function GET(url: string): Promise<any> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Api is not initialized yet");
    }
    const result = await fetch(`${NET_URL}${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        devId: apiKey!
      }
    });

    const data = await result.json();
    return { data };
  }

  async function POST<T>(url: string, params: T): Promise<any> {
    const apiKey = getApiKey();

    if (!apiKey) {
      throw new Error("Api is not initialized yet");
    }
    const result = await fetch(`${NET_URL}${url}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        devId: apiKey!
      },
      body:
        params === null
          ? void 0
          : typeof params === "string"
          ? params
          : JSON.stringify(params)
    });

    const data = await result.json();
    return { data };
  }

  // FIXME temporary helper for backwards compatibility
  async function GET0(url: string, params?: any) {
    const queryString = util.objToQueryString(params);
    if (queryString) {
      url += url.indexOf("?") > 0 ? `&${queryString}` : `?${queryString}`;
    }
    const { data } = await GET(url);
    if (data.code !== 0) {
      throw new Error(data);
    }

    return data;
  }

  return {
    fetchSplitPaymentOrders(
      params?:
        | {
            amount: number;
            currency: string;
          }
        | { amount: number; paymentId: number }
    ) {
      return GET0("/v1/split/payment/order", params);
    },

    sendOrderReceive(orderId: string) {
      return GET0(`/v1/send/order/receive/${orderId}`);
    },

    sendOrderClose(orderId: string) {
      return GET0(`/v1/send/order/close/${orderId}`);
    },

    earnGetDetail(orderId: string, tranType: number) {
      return GET0(`/v1/earn/get/${orderId}/${tranType}`);
    },

    settingPaymentVerify(qrCode: string) {
      return GET0("/v1/setting/payment/verify", { qrCode });
    },

    validateBsvAddress(address: string) {
      return GET0(`/api/address/${address}`);
    },

    earnGetAddress(type: number) {
      return GET0("/v1/earn/get/address", {
        type
      });
    },

    rechargeSend(orderId: string) {
      return GET0(`/v1/recharge/send/${orderId}`);
    },

    settingNode() {
      return GET0("/v1/setting/node");
    },

    settingNewVersion() {
      return GET0("/v1/setting/app/version");
    },

    sendOrderCancel(orderId: string) {
      return GET0(`/v1/send/order/cancel/${orderId}`);
    },

    async fetchSplitOrderList(): Promise<
      ServerResponse<ListResponse<SplitOrderListDetails>>
    > {
      const { data } = await POST("/v1/split/order/list", {});

      return data;
    },

    async fetchSplitLimits(): Promise<ServerResponse<SplitLimitInfo[]>> {
      return await GET0("/v1/split/order/limit");
    },

    async paymentsVerify(
      params: PaymentsVerifyParams
    ): Promise<ServerResponse<VerifyResult[]>> {
      const { data } = await POST("/v1/setting/payments/verify/info", params);
      if (data.code !== 0) {
        throw new Error("Payments verify error");
      }

      return data;
    },

    async rechargeDisputeImage(orderId: string, imgBase64: string) {
      const { data } = await POST("/v1/recharge/upload/img", {
        id: orderId,
        imgBase64,
        type: 1
      });

      if (data.code !== 0) {
        throw new Error("Dispute creation error ");
      }

      return data.data;
    },

    async initSendOrder(paymentId: number): Promise<PaymentOrdersConfig> {
      const { data } = await GET(`/v1/send/order/init/${paymentId}`);

      if (data.code !== 0) {
        throw new Error("Init Order error");
      }

      return data.data;
    },

    async fetchHaveSplitOrder(
      paymentId: number
    ): Promise<HaveSplitOrderResponse> {
      const { data } = await GET(`/v1/split/order/have/${paymentId}`);

      if (data.code !== 0) {
        throw new Error("Have split order error");
      }

      return data.data;
    },
    async fetchSplitOrderSelection(
      amount: number,
      payModeId: number
    ): Promise<SplitOrderSelectionResponse> {
      const { data } = await POST("/v1/split/order/selection", {
        amount,
        payModeId
      });

      if (data.code !== 0) {
        throw new Error("Split order selection error");
      }

      return data.data;
    },
    async acceptSplitOrder(
      amount: number,
      payModeId: number,
      orderId: string,
      address?: string
    ): Promise<ServerResponse<string>> {
      const payload = address
        ? {
            amount,
            payModeId,
            orderId,
            address
          }
        : {
            amount,
            payModeId,
            orderId
          };
      const { data } = await POST("/v1/split/order/accept", payload);

      if (data.code !== 0) {
        throw new Error("Split order selection error");
      }

      return data;
    },

    async acceptSplitOrderFiatFiat(
      amount: number,
      payModeId: number,
      orderId: string,
      receive_payment_id: number,
      receive_account: string,
      receive_amount: number
    ): Promise<ServerResponse<string>> {
      const payload = {
        amount,
        payModeId,
        orderId,
        receive_payment_id,
        receive_amount,
        receive_account
      };
      const { data } = await POST("/v1/split/order/accept", payload);

      if (data.code !== 0) {
        console.log(payload, data);
        throw new Error("Split order accept error");
      }

      return data;
    },

    async fetchSplitOrderPre(
      paymentId: number
    ): Promise<SplitOrderPreResponse> {
      const { data } = await GET(`/v1/split/order/pre?paymentId=${paymentId}`);

      if (data.code !== 0) {
        throw new Error("Split order pre error");
      }

      return data.data;
    },

    async registerFCMToken(token: string) {
      return await POST(`/v1/fcm/register/token?token=${token}`, {
        token
      });
    },

    async matchSplitOrder(
      receive_amount: number, // eslint-disable-line @typescript-eslint/camelcase
      receive_currency: string, // eslint-disable-line @typescript-eslint/camelcase
      payment_id: number // eslint-disable-line @typescript-eslint/camelcase
    ): Promise<MatchSplitOrderResponse> {
      const { data } = await POST("/v1/split/order/match", {
        receive_amount, // eslint-disable-line @typescript-eslint/camelcase
        receive_currency, // eslint-disable-line @typescript-eslint/camelcase
        payment_id // eslint-disable-line @typescript-eslint/camelcase
      });

      if (data.code !== 0) {
        throw new Error("Match split order error");
      }

      return data.data;
    },

    async matchSplitOrderFiatFiat(
      receive_amount: number, // eslint-disable-line @typescript-eslint/camelcase
      receive_payment_id: number, // eslint-disable-line @typescript-eslint/camelcase
      payment_id: number // eslint-disable-line @typescript-eslint/camelcase
    ): Promise<MatchSplitOrderResponse> {
      const { data } = await POST("/v1/split/order/match", {
        receive_amount, // eslint-disable-line @typescript-eslint/camelcase
        receive_payment_id, // eslint-disable-line @typescript-eslint/camelcase
        payment_id // eslint-disable-line @typescript-eslint/camelcase
      });

      if (data.code !== 0) {
        throw new Error("Match split order error");
      }

      return data.data;
    },

    async matchSplitOrder2(
      send_amount: number, // eslint-disable-line @typescript-eslint/camelcase
      send_currency: string, // eslint-disable-line @typescript-eslint/camelcase
      payment_id: number // eslint-disable-line @typescript-eslint/camelcase
    ): Promise<MatchSplitOrderResponse> {
      const { data } = await POST("/v1/split/order/match", {
        send_amount, // eslint-disable-line @typescript-eslint/camelcase
        send_currency, // eslint-disable-line @typescript-eslint/camelcase
        payment_id // eslint-disable-line @typescript-eslint/camelcase
      });

      if (data.code !== 0) {
        throw new Error("Match split order error");
      }

      return data.data;
    },

    async createSendOrder(
      params: CreateSendOrderPayload
    ): Promise<CreateSendOrderResponse> {
      const { data } = await POST("/v1/send/order/create", params);

      if (data.code !== 0) {
        throw new Error("Create send order error");
      }

      return data.data;
    },

    async cancelRecharge(orderNumber: string) {
      const { data } = await POST("/v1/recharge/cancel", {
        orderNumber
      });

      if (data.code !== 0) {
        throw new Error("Cancel recharge error");
      }

      return data.data;
    },

    async fetchFinanceBalance(address: string): Promise<FinanceBalance> {
      const { data } = await GET(`/v1/finance/balance/${address}`);

      if (data.code !== 0) {
        throw new Error("Error fetching balance");
      }

      return data.data;
    },

    async fetchUserInfo(address: string): Promise<ServerResponse<UserInfo>> {
      const { data } = await GET(`/v1/user/info?address=${address}`);
      return data;
    },

    async fetchCurrencyRates(): Promise<ServerResponse<CurrencyRate[]>> {
      const { data } = await GET("/v1/spot/currency/rates");
      return data;
    },

    async createOrder(
      params: CreateOrderParams
    ): Promise<ServerResponse<string>> {
      const { data } = await POST("/v1/spot/order/create", params);

      return data;
    },

    async fetchCurrencySetting(): Promise<ServerResponse<CurrencySetting>> {
      const { data } = await GET("/v1/setting/support/currency/get");

      return data;
    },

    async fetchCurrencyList(
      symbolType: number
    ): Promise<ServerResponse<CurrencyMeta[]>> {
      const { data } = await GET(
        `/v1/setting/support/currency/list/${symbolType}`
      );
      return data;
    },

    async fetchCurrencyUpdate(
      params:
        | {
            localSymbolId: number;
          }
        | {
            linkedInfo: string;
            linkedAccountId: number;
          }
    ): Promise<ServerResponse<CurrencySetting>> {
      const { data } = await POST(
        "/v1/setting/support/currency/update",
        params
      );

      return data;
    },

    async fetchPaymentList(): Promise<ServerResponse<PaymentMeta[]>> {
      const { data } = await GET("/v1/setting/payment");
      return data;
    },

    async fetchTransactionList(): Promise<
      ServerResponse<ListResponse<Transaction>>
    > {
      const { data } = await POST("/v1/spot/order/list", null);

      return data;
    },

    async fetchRelayOneLink(
      address: string,
      payload: string
    ): Promise<ServerResponse<ListResponse<EarnOrderDetails>>> {
      const { data } = await POST("/v1/one/link", {
        encryptedData: payload,
        publicKey: address
      });

      if (data.code !== 0) {
        throw new Error("Network error");
      }
      return data;
    }
  };
}
