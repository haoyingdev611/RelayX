import { NET_URL } from "../actions/types";
import Message from "bsv/lib/message";
import { PrivateKey } from "bsv";

async function POST<T>(
  url: string,
  params: T,
  headers: { [key: string]: string }
): Promise<any> {
  const result = await fetch(`${NET_URL}${url}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
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

async function postSignedRequest<T>(
  url: string,
  privateKey: PrivateKey,
  identityKey: string,
  payload: T
) {
  const timestamp = +new Date();
  const payloadString = JSON.stringify(payload);
  const sig = new Message(`${timestamp}POST${url}${payloadString}`).sign(
    privateKey
  );

  return await POST(url, payloadString, {
    "Content-Type": "application/json",
    RELAY_IDENTITY_KEY: identityKey,
    RELAY_TIMESTAMP: timestamp.toString(),
    RELAY_SIGNATURE: sig
  });
}

export async function bindKeys(
  privateKey: PrivateKey,
  oneAddress: string,
  identityKey: string,
  handle: string
): Promise<any> {
  if (handle) {
    return await postSignedRequest(
      "/v1/handle/bind2",
      privateKey,
      identityKey,
      {
        handle,
        identityKey,
        oneAddress,
        pubKey: privateKey.toPublicKey().toString()
      }
    );
  }
}
