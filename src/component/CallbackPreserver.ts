import { partial } from 'lodash';
import ICallbackPreserver from '../interface/ICallbackPreserver';

export default class CallbackPreserver implements ICallbackPreserver {
  private args?: any[];
  private executor?: IterableIterator<any>;
  private next?: (...args: any[]) => any;

  public preserve = (
    source: (callback: (...args: any[]) => Promise<void>) => Promise<void>,
  ): Promise<{}> => {
    let resolver: () => void;
    const status = new Promise(resolve => {
      resolver = resolve;
    });
    source((...args: any[]) => this.init(args, resolver));
    return status;
  };

  public close = () => {
    if (this.executor) {
      this.executor.next(true);
    }
    delete this.next;
    delete this.args;
    delete this.executor;
  };

  public run = (
    callable: (...args: any[]) => Promise<any>,
  ): Promise<any> | Promise<never> => {
    this.next = partial(callable, this.args);
    let result: Promise<any> | Promise<never>;
    try {
      const val = this.executor && this.executor.next(false).value;
      result = Promise.resolve(val);
    } catch (e) {
      result = Promise.reject(e);
    }
    return result;
  };

  private init = (args: any[], resolver: () => void): Promise<void> => {
    this.args = args;
    this.executor = this.execute();
    resolver();
    return Promise.resolve();
  };

  private *execute(): IterableIterator<any> {
    let close = false;
    while (!close) {
      close = yield this.next && this.next();
    }
  }
}
