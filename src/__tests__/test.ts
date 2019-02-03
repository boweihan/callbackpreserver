import CallbackPreserver from '../index';

let executing = false;
const fs = {
  readFile: (callback: (...args: any[]) => Promise<void>): Promise<void> => {
    executing = true;
    const result = callback(executing);
    executing = false;
    return result;
  },
};

test('instantiation', () => {
  const preserver = new CallbackPreserver();
  expect(typeof preserver.preserve).toBe('function');
  expect(typeof preserver.close).toBe('function');
  expect(typeof preserver.run).toBe('function');
});

test('preserve without args', () => {
  const preserver = new CallbackPreserver();
  expect(executing).toEqual(false);
  preserver.preserve(fs.readFile);
  expect(executing).toEqual(false);
  preserver.run(
    (...args: any[]): any => {
      expect(args).toEqual([true]);
    },
  );
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
