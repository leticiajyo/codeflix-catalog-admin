import isEqual from 'fast-deep-equal';

export abstract class ValueObject {
  public equals(vo: this): boolean {
    if (vo.constructor.name !== this.constructor.name) {
      return false;
    }

    return isEqual(vo, this);
  }
}
