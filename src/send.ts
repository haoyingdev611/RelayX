import { datasend, DatapayOptions, DatapayOutput } from "./datapay";
import { useApi } from "./api";
import { AppState } from "../reducers";
import { useSelector } from "react-redux";

export function useOneSend() {
  const mapStateToProps = (state: AppState) => {
    return {
      relayOnePublicAddress: state.wallet.relayOnePublicAddress || "",
      symbolName: state.main.localSymbolName,
      symbolId: state.main.symbolId,
      currencyExchangeRate: state.currency[state.main.symbolId]!,
      node: state.settingReducer.node,
      privateKey: state.wallet.privateKey!
    };
  };
  const {
    currencyExchangeRate,
    relayOnePublicAddress,
    symbolId,
    symbolName,
    node,
    privateKey
  } = useSelector(mapStateToProps);
  return async (amountSAT: number) => {
    const amountLocal = amountSAT / Number(currencyExchangeRate) / 100000000 || 0;
    const send = useSend();
    const { orderNumber, hash } = await send(
      [{ address: relayOnePublicAddress, value: Math.round(amountSAT) }],
        amountSAT,
        privateKey,
        amountLocal,
        {
          payMark: relayOnePublicAddress,
          localSymbolId: symbolId,
          localSymbolName: symbolName,
          symbolId
        },
        node
      );
    return {orderNumber, hash}
  }
}

export function useSend() {
  const api = useApi();
  return async function send(
    to: DatapayOutput[],
    amountSAT: number,
    privateKey: string,
    amountLocal: number,
    createOrderParams: {
      payMark: string;
      symbolId: number;
      localSymbolId: number;
      localSymbolName: string;
    },
    node: string
  ): Promise<{ orderNumber: string; hash: string }> {
    const hash = await sendRaw(to, privateKey, node);

    const params = {
      ...createOrderParams,
      type: 1 as const,
      amount: amountSAT,
      localAmount: Number(amountLocal),

      txid: hash
    };
    const result = await api.createOrder(params);
    return { orderNumber: result.data, hash };
  };
}

export async function sendRaw(
  to: DatapayOutput[],
  privateKey: string,
  node: string
): Promise<string> {
  const config: DatapayOptions = {
    pay: {
      key: privateKey,
      rpc: node,
      to
    }
  };

  return datasend(config);
}
