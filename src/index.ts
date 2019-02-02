export const Test = () => `Hello`;

export default class Transformer {
  private args: any[];
  private executor: IterableIterator<any>;
  private next: (...args: any[]) => Promise<any>;

  public create(source: (...args: any[]) => Promise<void>) {
    let resolver: () => void;
    const status = new Promise(resolve => {
      resolver = resolve;
    });
    source((...args: any[]) => this.init(args, resolver));
    return status;
  }

  public run = (callable: Function): Promise<any> => {
    this.next = _.partial(callable, this.ctx);
    try {
      let returnValue = this.worker && this.worker.next(false).value;
      return Promise.resolve(returnValue);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  private init(args: any[], resolver: () => void): Promise<any> {
    this.args = args;
    this.executor = this.execute();
    resolver();
    return Promise.resolve();
  }

  private *execute() {
    let close = false;
    while (!close) {
      close = yield this.next && this.next();
    }
  }
}
