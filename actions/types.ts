export const NET_URL = "https://www.relayx.io";

export type Action<S, T> = {
  type: S;
  payload: T;
};
