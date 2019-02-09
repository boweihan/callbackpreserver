import { partial } from 'lodash';
import ICallbackPreserver from '../interface/ICallbackPreserver';

export default class CallbackPreserver implements ICallbackPreserver {
  private args?: any[];
  private executor?: IterableIterator<any>;
  private next?: (...args: any[]) => any;

  // act as a dummy callback to initialize generator
  public preserve = (...args: any[]): void => {
    this.args = args;
    this.executor = this.execute();
  };

  // clean up the preserved callback
  public close = () => {
    if (this.executor) {
      this.executor.next(true);
    }
    delete this.next;
    delete this.args;
    delete this.executor;
  };

  // execute a callback using the preserved callback context
  public run = (callable: (...args: any[]) => any): Promise<any> => {
    if (!this.executor) {
      return Promise.reject(new Error('No Preserved Callback'));
    }
    if (this.args) {
      this.next = partial(callable, ...this.args);
    } else {
      this.next = callable;
    }
    let result: Promise<any> | Promise<never>;
    try {
      const val = this.executor && this.executor.next(false).value;
      result = Promise.resolve(val);
    } catch (e) {
      result = Promise.reject(e);
    }
    return result;
  };

  private *execute(): IterableIterator<any> {
    let close = false;
    while (!close) {
      close = yield this.next && this.next();
    }
  }
}
