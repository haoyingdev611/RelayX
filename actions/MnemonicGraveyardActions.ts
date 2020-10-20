import { Action } from "./types";

export type SaveMnemonicToGraveyard = Action<
  "save_mnemonic_to_graveyard",
  string
>;
export function saveMnemonicToGraveyard(
  payload: string
): SaveMnemonicToGraveyard {
  return {
    type: "save_mnemonic_to_graveyard",
    payload
  };
}

export type MnemonicGraveyardAction = SaveMnemonicToGraveyard;
