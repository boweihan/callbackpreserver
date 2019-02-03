import CallbackPreserver from '../index';

const fs = {
  readFile: () => undefined,
};

test('instantiation', () => {
  const preserver = new CallbackPreserver();
  expect(typeof preserver.preserve).toBe('function');
  expect(typeof preserver.close).toBe('function');
  expect(typeof preserver.run).toBe('function');
});

test('preserve', () => {
  const preserver = new CallbackPreserver();
  preserver.preserve(fs.readFile);
});

// let source = context => {
//   // do things
// };
//
// let t = new Transformer(source);
// t.execute(context => {
//   //do things
// });
// t.execute(context => {
//   // do things
// });
// t.close();
//
//
//
// let source = ExcelService.run((ctx) => {})
// let source = fs.readFile(() => {})
// let source = fs.writeFile(() => {})
