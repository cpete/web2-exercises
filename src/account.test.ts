import { describe, expect, it } from "vitest";

import { Account } from "./account.js";

describe("Account", () => {
  it("opens with a zero balance", () => {
    const account = new Account("acc-1");
    const event = account.handle({ accountId: "acc-1", type: "OpenAccount" });
    account.apply(event);

    expect(event.type).toBe("AccountOpened");
    expect(account.isOpened()).toBe(true);
    expect(account.getBalance()).toBe(0);
  });

  it("rejects commands before the account is opened", () => {
    const account = new Account("acc-1");

    expect(() => account.handle({ accountId: "acc-1", type: "Deposit", amount: 10 })).toThrow(
      "Account is not open",
    );
  });

  it("applies deposits to the balance", () => {
    const account = Account.fromEvents("acc-1", [
      { accountId: "acc-1", type: "AccountOpened", timestamp: new Date() },
    ]);

    const event = account.handle({ accountId: "acc-1", type: "Deposit", amount: 50 });
    account.apply(event);

    expect(event.type).toBe("DepositMade");
    expect(account.getBalance()).toBe(50);
  });

  it("rejects deposits with a non-positive amount", () => {
    const account = Account.fromEvents("acc-1", [
      { accountId: "acc-1", type: "AccountOpened", timestamp: new Date() },
    ]);

    expect(() => account.handle({ accountId: "acc-1", type: "Deposit", amount: 0 })).toThrow(
      "Amount must be a positive number",
    );
  });

  it("withdraws money when funds are sufficient", () => {
    const account = Account.fromEvents("acc-1", [
      { accountId: "acc-1", type: "AccountOpened", timestamp: new Date() },
      { accountId: "acc-1", type: "DepositMade", amount: 100, timestamp: new Date() },
    ]);

    const event = account.handle({ accountId: "acc-1", type: "Withdraw", amount: 40 });
    account.apply(event);

    expect(event.type).toBe("WithdrawalMade");
    expect(account.getBalance()).toBe(60);
  });

  it("rejects withdrawals that exceed the balance", () => {
    const account = Account.fromEvents("acc-1", [
      { accountId: "acc-1", type: "AccountOpened", timestamp: new Date() },
      { accountId: "acc-1", type: "DepositMade", amount: 10, timestamp: new Date() },
    ]);

    expect(() => account.handle({ accountId: "acc-1", type: "Withdraw", amount: 20 })).toThrow(
      "Insufficient funds",
    );
  });

  it("rebuilds state by replaying events", () => {
    const account = Account.fromEvents("acc-1", [
      { accountId: "acc-1", type: "AccountOpened", timestamp: new Date() },
      { accountId: "acc-1", type: "DepositMade", amount: 100, timestamp: new Date() },
      { accountId: "acc-1", type: "WithdrawalMade", amount: 30, timestamp: new Date() },
      { accountId: "acc-1", type: "DepositMade", amount: 5, timestamp: new Date() },
    ]);

    expect(account.getBalance()).toBe(75);
  });
});
