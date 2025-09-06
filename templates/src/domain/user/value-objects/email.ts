import { ValueObject } from '../../shared/value-object';

export class Email extends ValueObject<string> {
  protected validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new Error('Invalid email format');
    }
  }
}
