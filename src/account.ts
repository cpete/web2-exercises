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
    // TODO: Implement
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
    // TODO: Implement
  }

  /** Applies an event to the account's state. This is used to reconstruct state from events. */
  apply(event: AccountEvent): void {
    // TODO: Implement
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
