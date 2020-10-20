import { PublicKey, PrivateKey } from "bsv";
import ECIES from "bsv/ecies";
import { WalletState } from "../reducers/WalletReducer";
import { useApi } from "./api";

export function isValidRelayOneQR(qr: string): boolean {
  if (!qr || !qr.trim()) {
    return false;
  }
  const match = qr.match(/^relayonebeta:\/\/(.+)\?address=(.+)$/);
  if (!match) {
    return false;
  }

  try {
    const key = new PublicKey(match[1]);
    const address = key.toAddress().toString();
    if (address !== match[2]) {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

type LinkParams = {
  key: PublicKey;
  address: string;
};

export function getLinkParams(qr: string): LinkParams {
  const match = qr.match(/^relayonebeta:\/\/(.+)\?address=(.+)$/);
  if (!match) {
    throw new Error("Invalid QR");
  }

  return { key: new PublicKey(match[1]), address: match[2] };
}

export function useLinkRelayOne() {
  const api = useApi();
  return async function linkRelayOne(qr: string, wallet: WalletState) {
    const params = getLinkParams(qr);

    // encrypt private key
    const ecies = new ECIES()
      .privateKey(new PrivateKey(wallet.relayOnePrivateKey))
      .publicKey(params.key);

    const payload = ecies
      .encrypt(
        JSON.stringify({
          key: wallet.relayOnePrivateKey,
          identity: wallet.relayIdentityPrivateKey,
          version: "beta"
        })
      )
      .toString("hex");

    await api.fetchRelayOneLink(params.address, payload);
  };
}
