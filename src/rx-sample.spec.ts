import {
  allSettled,
  createEvent,
  createStore,
  EventCallable,
  fork,
} from "effector";
import { Subject } from "rxjs";
import { describe, test, expect, vi } from "vitest";

import { rxSample } from "./rx-sample";

describe("rxSample", () => {
  test("Should subscribe to observable", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = vi.fn() as unknown as EventCallable<string>;

    rxSample({
      source: mockChannel,
      subscribeOn: subscribe,
      unsubscribeOn: unsubscribe,
      target: target,
    });

    const scope = fork();

    await allSettled(subscribe, { scope });

    mockChannel.next("test");

    expect(target).toHaveBeenCalledWith("test");
    expect(mockChannel.observed).toBeTruthy();
  });

  test("Should unsubscribe from observable", async () => {
    const mockChannel = new Subject<string>();
    const subscribe = createEvent();
    const unsubscribe = createEvent();
    const target = vi.fn() as unknown as EventCallable<string>;

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
});
