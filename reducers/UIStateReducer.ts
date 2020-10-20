import { UIStateAction } from "../actions/UIStateActions";

export interface UIState {
  lastUsedTopUpPayment?: number;
  hideBackupWarning?: boolean;
}

const INITIAL_STATE: UIState = {};

export default (
  state: UIState = INITIAL_STATE,
  action: UIStateAction
): UIState => {
  switch (action.type) {
    case "set_last_used_top_up_payment":
      return {
        ...state,
        lastUsedTopUpPayment: action.payload
      };

    case "hide_backup_warning":
      return {
        ...state,
        hideBackupWarning: true
      };
  }

  return state;
};
