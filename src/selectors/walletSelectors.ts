import { AppState } from "../../reducers/index";

export function getBalance(state: AppState): number {
  const currencyExchangeRate = state.currency[state.main.symbolId] || 1;
  return state.wallet.satoshi / currencyExchangeRate / 100000000;
}

export function getBalanceShow(state: AppState): string {
  return getBalance(state).toFixed(2);
}

export function getRelayOneBalanceShow(state: AppState): string {
  const currencyExchangeRate = state.currency[state.main.symbolId] || 1;
  return (
    state.wallet.relayOneSatoshi /
    currencyExchangeRate /
    100000000
  ).toFixed(2);
}
