import {
  createStore,
  EventCallable,
  is,
  sample,
  Store,
  Event,
  attach,
  scopeBind,
} from "effector";
import { Observable, Subscription } from "rxjs";

type Input<D, R = D> = {
  source: Observable<D>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  fn?: (data: D) => R;
  target: EventCallable<R>;
};

type InputWithStore<D, R = D> = {
  source: Store<Observable<D>>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  fn?: (data: D) => R;
  target: EventCallable<R>;
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

      const boundTarget = scopeBind(target, { safe: true });

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
