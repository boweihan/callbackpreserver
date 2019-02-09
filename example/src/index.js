import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import CallbackPreserver from 'callbackpreserver';
console.log(CallbackPreserver);

let ctx;
let preserver = new CallbackPreserver();

const addWorksheet = context => {
  var sheets = context.workbook.worksheets;

  var sheet = sheets.add(String(new Date().getTime()));
  sheet.load('name, position');

  return context.sync().then(function() {
    console.log(
      `Added worksheet named "${sheet.name}" in position ${sheet.position}`,
    );
  });
};

window.Office.initialize = () => {
  render();
  window.Excel.run(context => {
    ctx = context;
    return addWorksheet(context);
  });
  preserver.preserve(window.Excel.run);
};

let render = () => {
  ReactDOM.render(
    <button onClick={() => addWorksheet(ctx)}>
      Add Worksheet (Callbacks)
    </button>,
    <button onClick={() => preserver.run(context => addWorksheet(context))}>
      Add Worksheet (Preserver)
    </button>,
    document.getElementById('root'),
  );
};
