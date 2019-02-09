interface ICallbackPreserver {
  preserve: (...args: any[]) => void;
  close: () => void;
  run: (
    callable: (...args: any[]) => Promise<any>,
  ) => Promise<any> | Promise<never>;
}

export default ICallbackPreserver;
