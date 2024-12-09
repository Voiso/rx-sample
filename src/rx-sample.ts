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
  fn?: (data: D) => R;
  target: EventCallable<R> | StoreWritable<R>;
};

type InputWithStore<D, R = D> = {
  source: Store<Observable<D>>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  fn?: (data: D) => R;
  target: EventCallable<R> | StoreWritable<R>;
};

export function rxSample<D, R = D>(config: Input<D, R>): void;
export function rxSample<D, R = D>(config: InputWithStore<D, R>): void;

export function rxSample<D, R = D>({
  source,
  subscribeOn,
  unsubscribeOn,
  fn,
  target,
}: Input<D, R> | InputWithStore<D, R>) {
  const updateEvent = createEvent<R | D>();
  const $subscription = createStore<Subscription | null>(null, {
    serialize: "ignore",
  });

  const $observable = is.store(source)
    ? source
    : createStore(source, { serialize: "ignore" });

  const subscribeFx = attach({
    source: $subscription,
    effect: (subscription, observable: Observable<D>) => {
      subscription?.unsubscribe();

      const boundTarget = scopeBind(is.event(target) ? target : updateEvent, {
        safe: true,
      });
      return observable.subscribe((data) =>
        boundTarget(fn ? fn(data) : (data as unknown as R))
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
    target: target as StoreWritable<R | D>,
  });

  sample({
    clock: [subscribeOn, $observable],
    source: $observable,
    target: subscribeFx,
  });

  sample({
    clock: subscribeFx.doneData,
    target: $subscription,
  });

  sample({
    clock: unsubscribeOn,
    source: $subscription,
    target: unsubscribeFx,
  });
}
