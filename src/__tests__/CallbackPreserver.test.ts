import CallbackPreserver from '../index';

describe('CallbackPreserver', () => {
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

  test('preserve', () => {
    const preserver = new CallbackPreserver();
    expect(executing).toEqual(false);
    preserver.preserve(fs.readFile);
    expect(executing).toEqual(false);

    /* arguments are preserved */
    preserver.run(
      (...args: any[]): any => {
        expect(args).toEqual([true]);
      },
    );
  });

  test('run - success', async () => {
    const preserver = new CallbackPreserver();
    preserver.preserve(fs.readFile);
    const result = preserver.run(() => 'result');
    expect(typeof result.then).toBe('function');

    /* no error results in a resolved promise */
    expect(await result).toBe('result');
  });

  test('run - error', async () => {
    const preserver = new CallbackPreserver();
    preserver.preserve(fs.readFile);
    const result = preserver.run(() => {
      throw new Error('error');
    });
    expect(typeof result.then).toBe('function');

    /* throwing an error results in rejected promise */
    try {
      await result;
    } catch (e) {
      expect(e.message).toBe('error');
    }
  });

  test('close', () => {
    const preserver = new CallbackPreserver();

    /* no preserved callback if callback has not been preserved */
    try {
      preserver.run(
        (...args: any[]): any => {
          expect(args).toEqual([true]);
        },
      );
    } catch (e) {
      expect(e.message).toBe('No Preserved Callback');
    }
    preserver.preserve(fs.readFile);
    preserver.run(
      (...args: any[]): any => {
        expect(args).toEqual([true]);
      },
    );
    preserver.close();

    /* no preserved callback if preserver has been closed */
    try {
      preserver.run(
        (...args: any[]): any => {
          expect(args).toEqual([true]);
        },
      );
    } catch (e) {
      expect(e.message).toBe('No Preserved Callback');
    }
  });
});
