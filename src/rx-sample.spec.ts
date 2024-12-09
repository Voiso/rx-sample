import { allSettled, createEvent, createStore, fork } from "effector";
import { Subject } from "rxjs";
import { describe, test, expect } from "vitest";

import { rxSample } from "./rx-sample";

describe("rxSample", () => {
  test("Should subscribe to observable", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent();

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    expect(mockChannel.observed).toBeTruthy();
  });

  test("Should unsubscribe from observable", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent();

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    await allSettled(unsubscribe, { scope });
  });

  test("Should write the value to the store", async () => {
    const scope = fork();
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent<string>();

    const $messages = createStore<string[]>([]).on(target, (state, message) => [
      ...state,
      message,
    ]);

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
    });

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    expect(scope.getState($messages)).toStrictEqual(["test"]);
  });

  test("Should transform data using fn before sending to target", async () => {
    const mockChannel = new Subject<number>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent<string>();
    const $processedMessage = createStore<string>("").on(
      target,
      (_, message) => message
    );

    const fn = (data: number) => `Value: ${data}`;

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      fn,
      target,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next(42);

    expect(scope.getState($processedMessage)).toStrictEqual("Value: 42");
  });

  test("Should pass data to target without fn", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent();
    const $processedMessage = createStore<string>("").on(
      target,
      (_, message) => message
    );

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("unchanged");

    expect(scope.getState($processedMessage)).toStrictEqual("unchanged");
  });

  test("Should apply fn to data and update store correctly", async () => {
    const mockChannel = new Subject<number>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = createEvent<string>();

    const $processedMessages = createStore<string[]>([]).on(
      target,
      (state, message) => [...state, message]
    );

    const fn = (data: number) => `Transformed ${data}`;

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
      fn,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next(100);

    expect(scope.getState($processedMessages)).toStrictEqual([
      "Transformed 100",
    ]);
  });

  test("Should pass data to target store without fn", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const $processedMessage = createStore<string>("");

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: $processedMessage,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("unchanged");

    expect(scope.getState($processedMessage)).toStrictEqual("unchanged");
  });
});
