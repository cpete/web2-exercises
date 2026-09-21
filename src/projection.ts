import type { AccountEvent } from "./event.js";

// --- Projection: liest Events, baut ein Read Model ---
export class AccountBalanceProjection {
  private balances = new Map<string, number>();

  on(event: AccountEvent): void {
    // TODO: Implement
  }

  balanceOf(accountId: string): number {
    // TODO: Implement
  }
}