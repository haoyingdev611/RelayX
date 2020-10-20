import I18n from "../locales";

export const TransactionStatus = {
  waitingConfirm: I18n.t("awaitingConfirm"),
  pending: I18n.t("pending"),
  conflict: I18n.t("conflict"),
  cancelled: I18n.t("cancelled"),
  completed: "" // I18n.t("completed")
};

const SenderTransactionStatus = [
  { tranType: 1, value: 0, label: TransactionStatus.pending },
  { tranType: 1, value: 100, label: TransactionStatus.pending },
  { tranType: 1, value: 200, label: TransactionStatus.waitingConfirm },
  { tranType: 1, value: 10000, label: TransactionStatus.completed },
  { tranType: 1, value: -100, label: TransactionStatus.conflict },
  { tranType: 1, value: -200, label: TransactionStatus.cancelled }
];

const ReceiverTransactionStatus = [
  { tranType: 2, value: 0, label: TransactionStatus.pending },
  { tranType: 2, value: 100, label: TransactionStatus.waitingConfirm },
  { tranType: 2, value: 200, label: TransactionStatus.pending },
  { tranType: 2, value: 10000, label: TransactionStatus.completed },
  { tranType: 2, value: -100, label: TransactionStatus.conflict },
  { tranType: 2, value: -200, label: TransactionStatus.cancelled }
];

export const getTransactionStatus = (
  tranType: number,
  value: number,
  isSender: boolean
) => {
  const statuses = isSender
    ? SenderTransactionStatus
    : ReceiverTransactionStatus;
  const status = statuses.find(
    item => item.tranType === tranType && item.value === value
  );

  return status ? status.label : "Dispute";
};
