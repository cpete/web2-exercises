import { TestScheduler } from "rxjs/testing";
import { describe, expect, it } from "vitest";
import { BehaviorSubject, delay, Observable, ReplaySubject, Subject } from "rxjs";

const testScheduler = new TestScheduler((actual, expected) => {
  // asserting the two objects are equal - required
  // for TestScheduler assertions to work via your test framework
  // e.g. using chai.
  expect(actual).toEqual(expected);
});

describe("Exercise 1: createObservable123", () => {
  it("emits 1, 2, 3 and completes", () => {
    // arrange
    const values: number[] = [];
    let completed = false;
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });
    
    // act
    source.subscribe({
      next: (value) => values.push(value),
      complete: () => (completed = true),
    });

    // assert
    expect(values).toEqual([1, 2, 3]);
    expect(completed).toBe(true);
  });

  // create a test with rxjs marbles to verify that the observable emits 1, 2, 3 and completes
  it("emits 1, 2, 3 and completes with rxjs marbles", () => {
    // arrange
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });
    const expected = '(123|)';

    // act and assert
    testScheduler.run((helpers) => {
      const { expectObservable } = helpers;
      
      expectObservable(source).toBe(expected, { 1: 1, 2: 2, 3: 3 });
    });
  });

  it("re-runs the producer for every subscription (cold behaviour)", () => {
    const coldObservable = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });
    const coldDelayed = coldObservable.pipe(delay(5)); // add a small delay to ensure that the subscriptions are not synchronous

    const firstRun: number[] = [];
    const secondRun: number[] = [];
    coldObservable.subscribe((value) => firstRun.push(value));
    coldDelayed.subscribe((value) => secondRun.push(value));
       
    expect(firstRun).toEqual([1, 2, 3]);
    setTimeout(() => {
      expect(secondRun).toEqual([1, 2, 3]);
    }, 10);
  });

  // same test as above with rxjs marbles to verify that the observable is cold and re-runs the producer for every subscription
  it("re-runs the producer for every subscription (cold behaviour) with rxjs marbles", () => {
      testScheduler.run((helpers) => {
        const { expectObservable } = helpers;
        const cold = new Observable<number>((subscriber) => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
          subscriber.complete();
        });
        const coldDelayed = cold.pipe(delay(5));
        const expected = '(123|)';
        const expectedDelayed = '-----(123|)';
        expectObservable(cold).toBe(expected, { 1: 1, 2: 2, 3: 3 });
        expectObservable(coldDelayed).toBe(expectedDelayed, { 1: 1, 2: 2, 3: 3 });
      });
  });
});

describe("Exercise 2: Subject", () => {
  it("creates a Subject and multicasts values to subscribers", () => {
    const subject = new Subject<number>();
    const receivedA: number[] = [];
    const receivedB: number[] = [];

    subject.next(1);
    subject.subscribe((value) => receivedA.push(value));
    subject.next(2);
    subject.subscribe((value) => receivedB.push(value));
    subject.next(3);
    
    expect(receivedA).toEqual([2, 3]);
    expect(receivedB).toEqual([3]);
  });
});

describe("Exercise 3: BehaviorSubject/ReplaySubject", () => {
  it("creates a BehaviorSubject and multicasts values to subscribers", () => {
    const behaviorSubject = new BehaviorSubject<number>(0);
    const receivedA: number[] = [];
    const receivedB: number[] = [];

    behaviorSubject.subscribe((value) => receivedA.push(value));
    behaviorSubject.next(1);
    behaviorSubject.subscribe((value) => receivedB.push(value));
    behaviorSubject.next(2);
    
    expect(receivedA).toEqual([0, 1, 2]);
    expect(receivedB).toEqual([1, 2]);
  });

  it("creates a ReplaySubject and multicasts values to subscribers", () => {
    const replaySubject = new ReplaySubject<number>(2); // buffer size of 2
    const receivedA: number[] = [];
    const receivedB: number[] = [];

    replaySubject.next(1);
    replaySubject.next(2);
    replaySubject.subscribe((value) => receivedA.push(value));
    replaySubject.next(3);
    replaySubject.subscribe((value) => receivedB.push(value));
    replaySubject.next(4);
    
    expect(receivedA).toEqual([1, 2, 3, 4]);
    expect(receivedB).toEqual([2, 3, 4]);
  });
});
