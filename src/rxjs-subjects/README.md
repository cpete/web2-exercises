# Exercise: RxJS Observables vs. Subjects

## Goal

Understand the difference between a plain `Observable` ("cold", unicast) and a
`Subject` ("hot", multicast), and get comfortable with the two most common
`Subject` variants: `BehaviorSubject` and `ReplaySubject`.

## Background

- A plain `Observable` is **cold**: the code inside `new Observable(...)` only
  runs when someone subscribes, and it runs **again, independently**, for
  every new subscriber.
- A `Subject` is both an `Observable` and an `Observer`. It is **hot** and
  **multicast**: calling `.next(value)` pushes that value to every subscriber
  that is currently subscribed. Subscribers that arrive late miss values that
  were already emitted.
- `BehaviorSubject<T>` is a `Subject` that requires an initial value, remembers
  the **current** value, and immediately replays it to any new subscriber.
- `ReplaySubject<T>` is a `Subject` that buffers the last `n` emitted values
  and replays that buffer to any new subscriber.

## Files

- [exercise/exercise.ts](exercise/exercise.ts) — the exercise description.
  There is nothing to implement here; instead, write the tests described in
  the comments (either in this file or directly in a `*.test.ts` file).
- [exercise/solution.test.ts](exercise/solution.test.ts) — a reference
  solution containing the tests for all three exercises, including
  equivalent versions written with RxJS marble testing (`TestScheduler`).
  Try to solve the exercise yourself first!

## Tasks

1. **Observable** — Create an `Observable<number>` that emits `1, 2, 3` and
   then completes. Write a test that verifies the emitted values. Is the
   Observable cold or hot? Is it multicast or unicast? Verify your answer by
   subscribing to it more than once and checking that the producer code runs
   again for each subscription.

2. **Subject** — Create a `Subject<number>`, add two subscribers to it at
   different points in time, and emit some values in between. Verify that
   both subscribers receive only the values emitted *after* they subscribed.
   Is the Subject cold or hot? Is it multicast or unicast?

3. **BehaviorSubject/ReplaySubject** — Adjust the code from Exercise 2:
   - first use a `BehaviorSubject` instead of a `Subject`, and verify that a
     late subscriber immediately receives the current value.
   - then use a `ReplaySubject` instead of a `Subject`, and verify that a
     late subscriber receives the last `n` buffered values.

## Running

```bash
npm test -- src/rxjs-subjects
```
