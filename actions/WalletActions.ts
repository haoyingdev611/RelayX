import { AsyncStorage } from "react-native";
import bip39 from "bip39";
import HDKey from "hdkey";
import CoinKey from "coinkey";
import { Action } from "./types";
import { bindKeys } from "../utils/api";
import { useDispatch } from "../src/types";
import { PrivateKey } from "bsv";
import { saveMnemonicToGraveyard } from "./MnemonicGraveyardActions";
import { useGetCurrencySettings, getHandlePinAction } from "./MainActions";
import {
  useOnSettingCurrencyList,
  useOnSettingPayment,
  useLoadConfig,
  saveApiKey
} from "./SettingActions";
import { setApiKey, useApi } from "../src/api";

export type LoadPrivateKeyPayload = {
  privateKey: string;
  publicAddress: string;
  relayOnePrivateKey: string;
  relayOnePublicAddress: string;
  relayIdentityPrivateKey: string;
};

export type LoadPrivateKeyAction = Action<
  "WALLET_LOAD_PRIVATE_KEY",
  LoadPrivateKeyPayload
>;
export function loadPrivateKey(
  payload: LoadPrivateKeyPayload
): LoadPrivateKeyAction {
  return {
    type: "WALLET_LOAD_PRIVATE_KEY",
    payload
  };
}

export type ReceiveBalancePayload = {
  satoshi: number;
  relayOneSatoshi: number;
};

export type ReceiveBalanceAction = Action<
  "WALLET_RECEIVE_BALANCE",
  ReceiveBalancePayload
>;
export function receiveBalanceAction(
  payload: ReceiveBalancePayload
): ReceiveBalanceAction {
  return {
    type: "WALLET_RECEIVE_BALANCE",
    payload
  };
}

export async function getKeyFromMnemonic(
  mnemonic: string
): Promise<{
  publicAddress: string;
  privateKey: string;
  relayOnePublicAddress: string;
  relayOnePrivateKey: string;
  relayIdentityPrivateKey: string;
}> {
  const seed = bip39.mnemonicToSeed(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed, {
    public: 0x0488b21e,
    private: 0x0488ade4
  });
  const key = hdkey.derive("m/44'/236'/0'/0/0");
  const ck = new CoinKey(key.privateKey, {
    public: 0x00,
    private: 0x80
  });
  const publicAddress = ck.publicAddress;
  const privateKey = ck.privateWif;

  const relayOnekey = hdkey.derive("m/44'/236'/1'/0/0");
  const relayOneCk = new CoinKey(relayOnekey.privateKey, {
    public: 0x00,
    private: 0x80
  });
  const relayOnePublicAddress = relayOneCk.publicAddress;
  const relayOnePrivateKey = relayOneCk.privateWif;

  const relayIdentityKey = hdkey.derive("m/0'/236'/0'/0/0");
  const relayIdentityCk = new CoinKey(relayIdentityKey.privateKey, {
    public: 0x00,
    private: 0x80
  });
  const relayIdentityPrivateKey = relayIdentityCk.privateWif;

  return {
    publicAddress,
    privateKey,
    relayOnePublicAddress,
    relayOnePrivateKey,
    relayIdentityPrivateKey
  };
}

export function useWalletInit() {
  const api = useApi();
  const getCurrencySettings = useGetCurrencySettings();
  const onSettingCurrencyList = useOnSettingCurrencyList();
  const onSettingPayment = useOnSettingPayment();
  const loadConfig = useLoadConfig();
  const dispatch = useDispatch();
  return async (mnemonic: string, handle: string) => {
    const oldMnemonic = await AsyncStorage.getItem("mnemonic");
    if (oldMnemonic && oldMnemonic !== mnemonic) {
      dispatch(saveMnemonicToGraveyard(oldMnemonic));
    }
    const keys = await getKeyFromMnemonic(mnemonic);
    await AsyncStorage.setItem("mnemonic", mnemonic);

    const { data } = await bindKeys(
      new PrivateKey(keys.privateKey),
      keys.relayOnePublicAddress!,
      new PrivateKey(keys.relayIdentityPrivateKey).toPublicKey().toString(),
      handle
    );

    if (data.code !== 0) {
      throw new Error("bind failed");
    }

    setApiKey(data.data);
    dispatch(saveApiKey(data.data));

    const userInfo = await api.fetchUserInfo(keys.publicAddress.toString());
    if (userInfo.code === 0) {
      dispatch(
        getHandlePinAction({
          handle: userInfo.data.handleName || "",
          pin: userInfo.data.pin || ""
        })
      );
    }
    if ((userInfo.data.handleName || "") !== handle) {
      throw new Error("Wallet init: handle mismatch");
    }
    await getCurrencySettings();
    await Promise.all([
      onSettingCurrencyList(2),
      onSettingPayment(),
      loadConfig()
    ]);
    dispatch(loadPrivateKey(keys));
  };
}
export type WalletAction = LoadPrivateKeyAction | ReceiveBalanceAction;
