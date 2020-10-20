import { Transaction, PrivateKey, Script, Opcode, UnspentOutput } from "bsv";

const defaults = {
  rpc: "https://api.bitindex.network",
  fee: 400
};

export interface DatapayOutput {
  address: string;
  value: number;
}

export interface DatapayOptions {
  pay: {
    rpc?: string;
    key: string;
    to: DatapayOutput[];
  };
  data?: string[];
}

async function POST(rpc: string, path: string, data: any) {
  return fetch(rpc + path, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      api_key:
        "39CZavEbCg7TncTnFPpk6wCejoaBKVzKzbSzzPBt8Ztc278ZYQYcrYoRsiUQGLAs1Q",
      "Content-Type": "application/json"
    }
  });
}

async function broadcast(rpc: string, transaction: string) {
  const result = await POST(rpc, "/api/tx/send", {
    rawtx: transaction
  });

  if (result.status !== 200) {
    // FIXME log to sentry
    console.log(await result.text());
    throw new Error("Broadcaset error");
  }

  const body = await result.json();

  return body.txid;
}

async function getUnspentUtxos(
  rpc: string,
  addresses: string[]
): Promise<UnspentOutput[]> {
  const result = await POST(rpc, "/api/addrs/utxo", {
    addrs: addresses.join(",")
  });

  if (result.status !== 200) {
    // FIXME log to sentry
    console.log(await result.text());
    throw new Error("UTXO error");
  }

  const unspent = await result.json();

  // FIXME
  return unspent.map((u: any) => new Transaction.UnspentOutput(u));
}

async function build(options: DatapayOptions) {
  let script = null;
  const rpcaddr = options.pay.rpc ? options.pay.rpc : defaults.rpc;
  if (options.data) {
    script = _script(options);
  }

  // key exists => create a signed transaction
  const key = options.pay.key;
  const privateKey = new PrivateKey(key);
  const address = privateKey.toAddress().toString();
  const res = await getUnspentUtxos(rpcaddr, [address]);
  const utxos = res.sort((a, b) => b.satoshis - a.satoshis).slice(0, 50);

  const tx = new Transaction().from(utxos);

  if (options.pay.to && Array.isArray(options.pay.to)) {
    options.pay.to.forEach(function(receiver) {
      tx.to(receiver.address, receiver.value);
    });
  }
  if (script) {
    tx.addOutput(new Transaction.Output({ script: script, satoshis: 0 }));
  }
  tx.change(address);

  const estSize = Math.ceil(tx._estimateSize() * 1.4);
  tx.fee(estSize);

  //Check all the outputs for dust
  for (let i = 0; i < tx.outputs.length; i++) {
    if (tx.outputs[i]._satoshis > 0 && tx.outputs[i]._satoshis < 546) {
      tx.outputs.splice(i, 1);
      i--;
    }
  }

  return tx.sign(privateKey);
}

export async function datasend(options: DatapayOptions) {
  const tx = await build(options);
  const rpcaddr = options.pay.rpc ? options.pay.rpc : defaults.rpc;
  return broadcast(rpcaddr, tx.toString());
}

// compose script
const _script = function(options: DatapayOptions) {
  if (options.data) {
    const s = new Script();
    // Add op_return
    s.add(Opcode.OP_FALSE);
    s.add(Opcode.OP_RETURN);
    options.data.forEach(function(item) {
      if (typeof item === "string") {
        if (/^0x/i.test(item)) {
          // ex: 0x6d02
          s.add(Buffer.from(item.slice(2), "hex"));
        } else {
          // ex: "hello"
          s.add(Buffer.from(item));
        }
      } else {
        throw Error("Malformed data");
      }
    });
    return s;
  }
  return null;
};
