// Commands used to send to aggregate account
export type AccountCommand = {
  accountId: string;
  type: "OpenAccount" | "CloseAccount" | "Deposit" | "Withdraw";
  amount?: number;
};
