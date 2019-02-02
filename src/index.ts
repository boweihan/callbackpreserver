export const Test = () => `Hello`;

export default class Transformer {
  private create = async (callable: () => any) => {
    let completed = () => {};
    const status = new Promise(resolve => {
      completed = resolve;
    });
    return status;
  };
}
