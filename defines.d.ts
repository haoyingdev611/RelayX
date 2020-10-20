declare module "bsv" {
  export class PrivateKey {
    constructor(key?: string);
    toWIF(): string;
    toPublicKey(): PublicKey;
    toAddress(): Address;
    static fromWIF(wif: string): PrivateKey;
    static fromRandom(): PrivateKey;
  }

  export class Address {
    static fromPrivateKey(key: PrivateKey): Address;
    static isValid(address: string): boolean;
  }

  export class PublicKey {
    constructor(key?: string);
    toAddress(): Address;
  }

  export class Script {
    static buildMultisigOut(keys: PublicKey[], treshhold: number): Script;
    static buildScriptHashOut(out: Output): Script;
    toAddress(): Address;
    add(opCode: Opcode | Buffer): this;
    toBuffer(): Buffer;
    isSafeDataOut(): boolean;
    isDataOut(): boolean;
    static fromASM(script: string): Script;
  }

  export enum Opcode {
    OP_FALSE,
    OP_RETURN
  }

  export class Transaction {
    // FIXME
    from(utxo: any): this;
    to(address: string, amount: number): this;
    addOutput(output: Output): this;
    fee(fee: number): this;
    feePerKb(feePerKb: number): this;
    change(address: string): this;
    sign(key: PrivateKey): this;
    // FIXME getter
    hash: string;
    serialize(): string;
    getFee(): number;
    outputAmount: number;
    _estimateFee(): number;
    _estimateSize(): number;
    getChangeOutput(): Output | null;

    outputs: Output[];

    static Output: typeof Output;
    static UnspentOutput: typeof UnspentOutput;
  }

  class Output {
    satoshis: number;
    _satoshis: number;
    constructor(opts: { script: Script; satoshis: number });
  }

  class UnspentOutput {
    satoshis: number;
    // FIXME
    constructor(data: any);
  }
}

declare module "bsv/ecies" {
  import { PrivateKey, PublicKey } from "bsv";

  export default class ECIES {
    privateKey(pkey: PrivateKey): this;
    publicKey(publicKey: PublicKey): this;
    decrypt(data: Buffer): Buffer;
    encrypt(data: string): Buffer;
  }
}

declare module "bsv/lib/message" {
  import { PrivateKey } from "bsv";

  export default class Message {
    constructor(message: string);
    sign(key: PrivateKey): string;
  }
}

declare module "satoshi-bitcoin" {
  export function toBitcoin(statoshi: number | string): number;
  export function toSatoshi(statoshi: number | string): number;
}

declare module "hdkey" {
  export default class HDNode {
    static fromMasterSeed(
      seed: Buffer,
      versions: { public: number; private: number }
    ): HDNode;
    publicKey: Buffer;
    privateKey: Buffer;
    chainCode: Buffer;
    constructor();
    derive(path: string): HDNode;
    toJSON(): { xpriv: string; xpub: string };
    static fromJSON(obj: { xpriv: string; xpub: string }): HDNode;
  }
}

declare module "coinkey" {
  export default class CoinKey {
    constructor(privateKey: Buffer, opts: { public: number; private: number });

    publicAddress: string;
    privateWif: string;
  }
}

declare module "react-native-qr-scanner" {
  export function QRreader(url: string): Promise<string>;
}

declare module "react-native-send-intent" {
  export function openApp(url: string): Promise<boolean>;
}

declare module "react-native-checkbox" {
  import React from "react";

  interface Props {
    label: string;
    checked: boolean;
    checkedImage: number;
    uncheckedImage: null;
    onChange: () => any;
  }

  export default class Checkbox extends React.Component<Props> {}
}

declare module "rn-range-slider" {
  import React from "react";
  import { ViewStyle } from "react-native";

  interface Props {
    style: ViewStyle;
    gravity: "center";
    min: number;
    max: number;
    step: number;
    labelStyle: "none";
    selectionColor: string;
    blankColor: string;
    initialLowValue: number;
    initialHighValue: number;
    onValueChanged: (low: number, high: number) => any;
  }

  export default class Checkbox extends React.Component<Props> {}
}
