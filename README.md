# CallbackPreserver

<img src="./preserver.png" width="300px"/>

A utility class for preserving JavaScript callback function context so that the same callback can be invoked multiple times.

### Installation

`npm install --save callbackpreserver`

### Usage

1. Instantiate CallbackPreserver.

```
import CallbackPreserver from 'callbackpreserver';
const preserver = new CallbackPreserver();
```

2. Use CallbackPreserver -> preserve() in place of a callback function to hold callback context for later.

```
const methodThatAcceptsCallback = (callback) => {
  const context = "temporary context";
  callback(context);
}
methodThatAcceptsCallback(preserver.preserve);
```

3. Use CallbackPreserver -> run() to invoke the preserved original callback on demand.

```
// invoke preserved callback
preserver.run((context) => {
  console.log(context); // "temporary context"
});

// invoke preserved callback again - idempotence
preserver.run((context) => {
  console.log(context); // "temporary context"
});
```

### Use-Cases

CallbackPreserver provides a simple mechanism for code cleanliness. However, this pattern shines when used in conjuction with certain APIs that require batched context-aware callbacks. An example of this is Microsoft's `Excel.run` API used by O365 Addins to interact with Excel documents - https://docs.microsoft.com/en-us/office/dev/add-ins/excel/excel-add-ins-core-concepts.

Typical usage of `Excel.run`:

```
Excel.run(function (context) {
  // load the selected range
  const selectedRange = context.workbook.getSelectedRange();
  selectedRange.load('address');
  context.sync()
    .then(function () {
      console.log('The selected range is: ' + selectedRange.address);
  });

  // load sheet names
  var sheets = context.workbook.worksheets;
  sheets.load("items/name");
  return context.sync()
    .then(function () {
      for (var i in sheets.items) {
        console.log(sheets.items[i].name);
      }
    });
})
```

In the above example, the callback accepted by `Excel.run` is invoked with a proxy context object which is run asynchronously as a batch of operations. This makes it difficult to run your own JavaScript alongside Excel operations. This is where CallbackPreserver can come in.

```
const preserver = new CallbackPreserver();
Excel.run(preserver.preserve);
await preserver.run((context) => // perform Excel action)
// run your own code
await preserver.run((context) => // perform Excel action)
// run your own code
preserver.close() // allow context to be garbage collected
```

With CallbackPreserver the context can be reused across multiple invocations. In this example Excel operations that share a context can be pushed one at a time instead of in a batch.

### API Interface

```
interface ICallbackPreserver {
  preserve: (...args: any[]) => void;
  close: () => void;
  run: (
    callable: (...args: any[]) => Promise<any>,
  ) => Promise<any> | Promise<never>;
}

```

### Notes

CallbackPreserver is an experimental code cleanup mechanism that utilizes ES6 generators under the hood. Use at your own risk!
