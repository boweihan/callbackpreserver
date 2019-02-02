interface ICallbackPreserver {
  preserve: (source: (...args: any[]) => Promise<void>) => Promise<{}>;
  close: () => void;
  run: (
    callable: (...args: any[]) => Promise<any>,
  ) => Promise<any> | Promise<never>;
}

export default ICallbackPreserver;
