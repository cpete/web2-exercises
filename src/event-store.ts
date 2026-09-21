// In-memory event store, keyed by aggregate (account) id

import type { AccountEvent } from "./event.js";

// An in-memory event store that stores events for each account by account id.
export class EventStore {
  private readonly eventsByAccountId = new Map<string, AccountEvent[]>();

  // Append an event to the store for a given account id.
  append(accountId: string, event: AccountEvent): void {
    const events = this.eventsByAccountId.get(accountId) ?? [];
    events.push(event);
    this.eventsByAccountId.set(accountId, events);
  }

  // Load all events for a given account id. Returns an empty array if no events exist for that account.
  load(accountId: string): AccountEvent[] {
    return this.eventsByAccountId.get(accountId) ?? [];
  }
}
