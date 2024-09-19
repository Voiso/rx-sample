# rx-sample

`rx-sample` is a utility for working with RxJS in conjunction with Effector, making it easy to manage subscriptions to Observables using Effector events.

## Installation

You can install the `rx-sample` package via npm:

```bash
npm install rx-sample
```

## Quick Start

### Usage Example

Here’s a basic example of how to use rxSample in your project:

```ts
import { Subject } from "rxjs";
import { createEvent } from "effector";
import { rxSample } from "rx-sample";

// Create Effector events
const mockChannel = new Subject();
const subscribe = createEvent();
const unsubscribe = createEvent();
const target = createEvent();

// Use rxSample
rxSample({
  source: mockChannel,
  subscribeOn: subscribe,
  unsubscribeOn: unsubscribe,
  target,
});

// Example usage of events
// Start subscription to mockChannel
sample({
  clock: subscribeTriggered, // Some event
  target: subscribe,
});

mockChannel.next("some data"); // Send data

sample({
  clock: unsubscribeTriggered, // Some event
  target: unsubscribe,
});
```

## Parameter Description

The rxSample function takes a single argument — an object with four required parameters:

```ts
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
```

- **`source`**: `Observable<D>` — The Observable to subscribe to.
- **`subscribeOn`**: `EventCallable<S>` — An Effector event that triggers the subscription to `source`.
- **`unsubscribeOn`**: `EventCallable<U>` — An Effector event that triggers the unsubscription from `source`.
- **`target`**: `EventCallable<D> | EventCallable<void>` — An Effector event where data from `source` will be sent, or a void event to execute side effects.

## How It Works

- **Subscribe to the Observable**: When the `subscribeOn` event triggers, the function subscribes to the specified `source` and starts sending data from the Observable to the `target`.

- **Unsubscribe from the Observable**: When the `unsubscribeOn` event triggers, the function unsubscribes from `source`, freeing resources and stopping the data flow.

- **Store the Subscription**: The subscription is stored in an internal Effector store (`$subscription`), allowing easy unsubscription management and ensuring that the subscription is always properly terminated.

## Detailed Example

Suppose we have an Observable representing a stream of messages, and we want to manage subscriptions to this stream using Effector events.

You can see example here: [codesandox](https://goo.su/GYFyEP)

## Common Use Cases

- Managing Real-Time Data Subscriptions: For example, news feeds, chat messages, server updates.

- Integration with Existing Systems: rx-sample is ideal for scenarios where you need to manage subscriptions to Observables within your application using Effector events.

### Additional info

Special thanks to VOISO frontend developers:

<table>
<tr>
  <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/no-treasure>
            <img src=https://avatars.githubusercontent.com/u/58954499?v=4 width="100;"  alt=no-treasure/>
            <br />
            <sub style="font-size:14px"><b>Arseniy</b></sub>
        </a>
    </td>
    <td align="center" style="word-wrap: break-word; width: 150.0; height: 150.0">
        <a href=https://github.com/AndreyTheWeb>
            <img src=https://avatars.githubusercontent.com/u/69761642?v=4 width="100;"  alt=AndreyTheWeb/>
            <br />
            <sub style="font-size:14px"><b>Andrey</b></sub>
        </a>
    </td>
</tr>
</table>
