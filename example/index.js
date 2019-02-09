const path = require('path');
const fs = require('fs');
const CallbackPreserver = require('callbackpreserver');

processFile = content => {
  console.log(content);
};

console.log('starting');
const file = fs.readFile(path.resolve(__dirname, '../book.txt'));

fs.readFile(
  path.resolve(__dirname, '../book.txt', (err, data) => {
    processFile(data);
  }),
);
