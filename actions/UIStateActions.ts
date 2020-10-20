import { Action } from "./types";

export type SetLastUsedTopUpPayment = Action<
  "set_last_used_top_up_payment",
  number
>;
export function setLastUsedTopUpPayment(
  payload: number
): SetLastUsedTopUpPayment {
  return {
    type: "set_last_used_top_up_payment",
    payload
  };
}

export type HideBackupWarning = Action<"hide_backup_warning", boolean>;
export function hideBackupWarning(): HideBackupWarning {
  return {
    type: "hide_backup_warning",
    // only to please typings, isnt used in reducer
    payload: true
  };
}

export type UIStateAction = SetLastUsedTopUpPayment | HideBackupWarning;
