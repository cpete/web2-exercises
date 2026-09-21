// Aggregate account

import type { AccountCommand } from "./command.js";
import type { AccountEvent } from "./event.js";

export class Account {
  private balance = 0;
  private opened = false;

  constructor(private readonly accountId: string) {}

  /**
   * Reconstructs an account from a list of events.
   */
  static fromEvents(accountId: string, events: AccountEvent[]): Account {
    const account = new Account(accountId);
    for (const event of events) {
      account.apply(event);
    }
    return account;
  }

  getBalance(): number {
    return this.balance;
  }

  isOpened(): boolean {
    return this.opened;
  }

  /**
   * Validates a command against the current state and turns it into an event.
   * 
   * Does not mutate state itself; callers must apply() the returned event.
   * 
   * Throws an error if the command is invalid given the current state.
   * 
   * @returns the resulting event if the command is valid.
   */
  handle(command: AccountCommand): AccountEvent {
    switch (command.type) {
      case "OpenAccount":
        if (this.opened) {
          throw new Error("Account is already open");
        }
        return { accountId: this.accountId, type: "AccountOpened", timestamp: new Date() };

      case "CloseAccount":
        if(this.opened){
          return { accountId: this.accountId, type: "AccountClosed", timestamp: new Date() };
        }
        throw new Error("Account is not open");
      case "Deposit": {
        if(!this.opened){
          throw new Error("Account is not open");
        }

        if(typeof command.amount !== "number" || !this.isPositiveAmount(command.amount)){
          throw new Error("Amount must be a positive number");
        }

        return {
          accountId: this.accountId,
          type: "DepositMade",
          amount: command.amount,
          timestamp: new Date(),
        };
      }

      case "Withdraw": {
        if(!this.isOpened()){
          throw new Error("Account is not open");
        }

        if(typeof command.amount !== "number" || !this.isPositiveAmount(command.amount)){
          throw new Error("Amount must be a positive number");
        }

        if (!this.hasSufficientFunds(command.amount)) {
          throw new Error("Insufficient funds");
        }
        
        return {
          accountId: this.accountId,
          type: "WithdrawalMade",
          amount: command.amount,
          timestamp: new Date(),
        };
      }
    }
  }

  /** Applies an event to the account's state. This is used to reconstruct state from events. */
  apply(event: AccountEvent): void {
    switch (event.type) {
      case "AccountOpened":
        this.opened = true;
        break;
      case "AccountClosed":
        this.opened = false;
        break;
      case "DepositMade":
        this.balance += event.amount ?? 0;
        break;
      case "WithdrawalMade":
        this.balance -= event.amount ?? 0;
        break;
    }
  }

  /**
   * Business rule checks to ensure the amount is a positive number before performing certain operations.
   */
  private isPositiveAmount(amount: number): boolean {
    return Number.isFinite(amount) && amount > 0;
  }

  /**
   * Business rule checks to ensure the account has sufficient funds before allowing a withdrawal.
   */
  private hasSufficientFunds(amount: number): boolean {
    return !(amount > this.balance);
  }
}
