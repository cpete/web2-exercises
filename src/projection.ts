import type { AccountEvent } from "./event.js";

// --- Projection: liest Events, baut ein Read Model ---
export class AccountBalanceProjection {
  private balances = new Map<string, number>();

  on(event: AccountEvent): void {
    switch (event.type) {
      case 'AccountOpened':
        this.balances.set(event.accountId, 0);
        break;
      case 'DepositMade':
        this.balances.set(event.accountId,
          (this.balances.get(event.accountId) ?? 0) + (event.amount ?? 0));
        break;
      case 'WithdrawalMade':
        this.balances.set(event.accountId,
          (this.balances.get(event.accountId) ?? 0) - (event.amount ?? 0));
        break;
    }
  }

  balanceOf(accountId: string): number {
    return this.balances.get(accountId) ?? 0;
  }
}