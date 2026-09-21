// Events for aggregate account

export type AccountEvent = {
  accountId: string;
  type: "AccountOpened" | "AccountClosed" | "DepositMade" | "WithdrawalMade";
  amount?: number;
  timestamp: Date;
};