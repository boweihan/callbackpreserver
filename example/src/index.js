import React from 'react';
import ReactDOM from 'react-dom';

const Office = window.Office;
let elem = document.getElementById('root');

let render = () => {
  if (elem) {
    ReactDOM.render(<div>boop</div>, elem);
  }
};

Office.initialize = () => {
  render();
};
