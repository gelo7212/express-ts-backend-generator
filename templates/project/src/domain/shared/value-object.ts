export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
    this.validate();
  }

  get value(): T {
    return this._value;
  }

  protected abstract validate(): void;

  equals(valueObject: ValueObject<T>): boolean {
    return JSON.stringify(this._value) === JSON.stringify(valueObject._value);
  }
}
