import {
  createStore,
  EventCallable,
  is,
  sample,
  Store,
  Event,
  attach,
  scopeBind,
  StoreWritable,
  createEvent,
} from "effector";
import { Observable, Subscription } from "rxjs";

type Input<D, R = D> = {
  source: Observable<D>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  fn: (data: D) => R;
  target: EventCallable<R> | StoreWritable<R>;
};

type InputWithStore<D, R = D> = {
  source: Store<Observable<D>>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  fn: (data: D) => R;
  target: EventCallable<R> | StoreWritable<R>;
};

type InputWithoutFn<D> = {
  source: Observable<D>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  target: EventCallable<D> | StoreWritable<D>;
};

type InputWithStoreWithoutFn<D> = {
  source: Store<Observable<D>>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  target: EventCallable<D> | StoreWritable<D>;
};

function hasFn<D, R>(
  config:
    | Input<D, R>
    | InputWithStore<D, R>
    | InputWithoutFn<D>
    | InputWithStoreWithoutFn<D>
): config is Input<D, R> | InputWithStore<D, R> {
  return "fn" in config && typeof config.fn === "function";
}

export function rxSample<D, R = D>(
  config:
    | Input<D, R>
    | InputWithStore<D, R>
    | InputWithoutFn<D>
    | InputWithStoreWithoutFn<D>
) {
  const updateEvent = createEvent<R | D>();
  const $subscription = createStore<Subscription | null>(null, {
    serialize: "ignore",
  });

  const $observable = is.store(config.source)
    ? config.source
    : createStore(config.source, { serialize: "ignore" });

  const subscribeFx = attach({
    source: $subscription,
    effect: (subscription, observable: Observable<D>) => {
      subscription?.unsubscribe();

      const boundTarget = scopeBind(
        is.event(config.target) ? config.target : updateEvent,
        { safe: true }
      );

      return observable.subscribe((data) =>
        boundTarget(hasFn(config) ? config.fn(data) : (data as unknown as R))
      );
    },
  });

  const unsubscribeFx = attach({
    source: $subscription,
    effect: (subscription) => {
      subscription?.unsubscribe();
    },
  });

  sample({
    clock: updateEvent,
    target: config.target as StoreWritable<R | D>,
  });

  sample({
    clock: [config.subscribeOn, $observable],
    source: $observable,
    target: subscribeFx,
  });

  sample({
    clock: subscribeFx.doneData,
    target: $subscription,
  });

  sample({
    clock: config.unsubscribeOn,
    source: $subscription,
    target: unsubscribeFx,
  });
}
