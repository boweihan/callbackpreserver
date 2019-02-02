import { partial } from "lodash";

export default class ContextFreezer {
  private args?: any[];
  private executor?: IterableIterator<any>;
  private next?: (...args: any[]) => any;

  public create = (source: (...args: any[]) => Promise<void>) => {
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

  private init = (args: any[], resolver: () => void): Promise<any> => {
    this.args = args;
    this.executor = this.execute();
    resolver();
    return Promise.resolve();
  };

  private *execute() {
    let close = false;
    while (!close) {
      close = yield this.next && this.next();
    }
  }
}
