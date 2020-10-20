import { WalletAction } from "../actions/WalletActions";

export type WalletState = {
  privateKey?: string;
  publicAddress?: string;
  // unconfirmed + confirmed
  satoshi: number;
  relayOnePrivateKey?: string;
  relayOnePublicAddress?: string;
  relayOneSatoshi: number;
  relayIdentityPrivateKey?: string;
};

const INITIAL_STATE: WalletState = {
  privateKey: void 0,
  publicAddress: void 0,
  satoshi: 0,
  relayOnePrivateKey: void 0,
  relayOnePublicAddress: void 0,
  relayOneSatoshi: 0,
  relayIdentityPrivateKey: void 0
};

export default (
  state: WalletState = INITIAL_STATE,
  action: WalletAction
): WalletState => {
  switch (action.type) {
    case "WALLET_LOAD_PRIVATE_KEY":
      return {
        ...state,
        privateKey: action.payload.privateKey,
        publicAddress: action.payload.publicAddress,
        relayOnePrivateKey: action.payload.relayOnePrivateKey,
        relayOnePublicAddress: action.payload.relayOnePublicAddress,
        relayIdentityPrivateKey: action.payload.relayIdentityPrivateKey
      };

    case "WALLET_RECEIVE_BALANCE":
      return {
        ...state,
        satoshi: action.payload.satoshi,
        relayOneSatoshi: action.payload.relayOneSatoshi
      };
  }
  return state;
};
