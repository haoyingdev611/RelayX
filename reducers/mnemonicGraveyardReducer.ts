import { MnemonicGraveyardAction } from "../actions/MnemonicGraveyardActions";

export type MnemonicGraveyardState = string[];

const INITIAL_STATE: MnemonicGraveyardState = [];

export default (
  state: MnemonicGraveyardState = INITIAL_STATE,
  action: MnemonicGraveyardAction
): MnemonicGraveyardState => {
  switch (action.type) {
    case "save_mnemonic_to_graveyard":
      return [...state, action.payload];
  }

  return state;
};
