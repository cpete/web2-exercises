import type { AccountEvent } from "./event.js";

// An in-memory event store that stores events for each account by account id.
export class EventStore {
  private readonly eventsByAccountId = new Map<string, AccountEvent[]>();

  // Append an event to the store for a given account id.
  append(accountId: string, event: AccountEvent): void {
    // TODO: Implement
  }

  // Load all events for a given account id. Returns an empty array if no events exist for that account.
  load(accountId: string): AccountEvent[] {
    // TODO: Implement
  }
}
