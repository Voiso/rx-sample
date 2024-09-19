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

type Input<D> = {
  source: Observable<D>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  target: EventCallable<D>;
};

type InputWithStore<D> = {
  source: Store<Observable<D>>;
  subscribeOn: Event<unknown>;
  unsubscribeOn: Event<unknown>;
  target: EventCallable<D>;
};

export function rxSample<D>(config: Input<D>): void;
export function rxSample<D>(config: InputWithStore<D>): void;

export function rxSample<D>({
  source,
  subscribeOn,
  unsubscribeOn,
  target,
}: Input<D> | InputWithStore<D>) {
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

      return observable.subscribe(boundTarget);
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
