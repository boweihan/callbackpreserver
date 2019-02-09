import CallbackPreserver from '../index';

describe('CallbackPreserver', () => {
  let flag = false;
  const func = (callback: (...args: any[]) => any) => {
    flag = true;
    callback(flag);
    flag = false;
  };

  test('instantiation', () => {
    const preserver = new CallbackPreserver();
    expect(typeof preserver.preserve).toBe('function');
    expect(typeof preserver.close).toBe('function');
    expect(typeof preserver.run).toBe('function');
  });

  test('preserve', done => {
    const preserver = new CallbackPreserver();
    expect(flag).toEqual(false);
    func(preserver.preserve);
    expect(flag).toEqual(false);

    /* arguments are preserved */
    preserver.run(
      (...args: any[]): any => {
        expect(args).toEqual([true]);
        done();
      },
    );
  });

  test('run - success', done => {
    const preserver = new CallbackPreserver();
    func(preserver.preserve);
    const promise = preserver.run(() => 'result');
    promise.then(result => {
      /* no error results in a resolved promise */
      expect(result).toBe('result');
      done();
    });
  });

  test('run - error', done => {
    const preserver = new CallbackPreserver();
    func(preserver.preserve);
    const promise = preserver.run(() => {
      throw new Error('error');
    });
    promise.catch(e => {
      expect(e.message).toBe('error');
      done();
    });
  });

  test('close with no preserved callback', done => {
    const preserver = new CallbackPreserver();

    /* no preserved callback if callback has not been preserved */

    preserver
      .run(
        (...args: any[]): any => {
          expect(args).toEqual([true]);
        },
      )
      .catch(e => {
        expect(e.message).toBe('No Preserved Callback');
        preserver.close();
        done();
      });
  });

  test('close properly', done => {
    const preserver = new CallbackPreserver();
    func(preserver.preserve);
    preserver
      .run(
        (...args: any[]): any => {
          expect(args).toEqual([true]);
        },
      )
      .then(() => {
        preserver.close();
        done();
      });
  });

  test('no preserved callback if preserver has already been closed', done => {
    const preserver = new CallbackPreserver();
    func(preserver.preserve);
    preserver.close();
    /* no preserved callback if preserver has been closed */

    preserver
      .run(
        (...args: any[]): any => {
          expect(args).toEqual([true]);
        },
      )
      .catch(e => {
        expect(e.message).toBe('No Preserved Callback');
        done();
      });
  });
});

describe('CallbackPreserver Usage', () => {
  let code = 0;
  const func = (callback: (...args: any[]) => any) => {
    code = 12345;
    callback(code);
    code = 0;
  };

  test('Reusing the callback', async () => {
    const preserver = new CallbackPreserver();
    func(preserver.preserve);

    await preserver.run(
      (context: number): any => {
        expect(context).toEqual(12345);
      },
    );

    expect(code).toEqual(0);

    await preserver.run(
      (context): any => {
        expect(context * 10).toEqual(123450);
      },
    );

    preserver.close();
  });
});
