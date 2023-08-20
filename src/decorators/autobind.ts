export function Binder(_: any, _2: string, descriptor: PropertyDescriptor) {
  return {
    enumerable: false,
    configurable: true,
    get() {
      const bindedF = descriptor.value.bind(this);
      return bindedF;
    },
  };
}
