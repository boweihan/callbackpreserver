import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import CallbackPreserver from 'callbackpreserver';

let ctx;
let preserver = new CallbackPreserver();

const addWorksheet = context => {
  var sheets = context.workbook.worksheets;

  var sheet = sheets.add(String(new Date().getTime()));
  sheet.load('name, position');

  return context.sync().then(() => {
    console.log(
      `Added worksheet named "${sheet.name}" in position ${sheet.position}`,
    );
  });
};

// retain context or preserve, preserving preserves closure context whereas
// maintaining a reference to the context does not!
window.Office.initialize = () => {
  render();
  window.Excel.run(context => {
    ctx = context;
    return addWorksheet(context);
  });
  preserver.preserve(window.Excel.run);
};

// two different ways to use use context
let render = () => {
  ReactDOM.render(
    <div>
      <button onClick={() => addWorksheet(ctx)}>
        Add Worksheet (Callbacks)
      </button>
      <button
        onClick={() => {
          preserver.run(context => addWorksheet(context));
        }}
      >
        Add Worksheet (Preserver)
      </button>
    </div>,
    document.getElementById('root'),
  );
};
