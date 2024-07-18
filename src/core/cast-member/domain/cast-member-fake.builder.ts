import { Chance } from 'chance';
import {
  CastMember,
  CastMemberId,
  CastMemberType,
} from './cast-member.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class CastMemberFakeBuilder<T = any> {
  private _castMemberId: PropOrFactory<CastMemberId> = new CastMemberId();
  private _name: PropOrFactory<string> = () => this.chance.word();
  private _type: PropOrFactory<CastMemberType> = () => CastMemberType.ACTOR;
  private _createdAt: PropOrFactory<Date> = new Date();

  private count;

  static oneActor() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.ACTOR,
    );
  }

  static oneDirector() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.DIRECTOR,
    );
  }

  static manyActors(count: number) {
    return new CastMemberFakeBuilder<CastMember[]>(count).withType(
      CastMemberType.ACTOR,
    );
  }

  static manyDirectors(count: number) {
    return new CastMemberFakeBuilder<CastMember[]>(count).withType(
      CastMemberType.DIRECTOR,
    );
  }

  static manyCastMembers(count: number) {
    return new CastMemberFakeBuilder<CastMember[]>(count);
  }

  private chance: Chance.Chance;

  private constructor(count: number = 1) {
    this.count = count;
    this.chance = Chance();
  }

  withCastMemberId(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._castMemberId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withType(valueOrFactory: PropOrFactory<CastMemberType>) {
    this._type = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): T {
    const castMembers = new Array(this.count)
      .fill(undefined)
      .map((_, index) => {
        return new CastMember({
          castMemberId: this.callFactory(this._castMemberId, index),
          name: this.callFactory(this._name, index),
          type: this.callFactory(this._type, index),
          createdAt: this.callFactory(this._createdAt, index),
        });
      });
    return this.count === 1 ? (castMembers[0] as any) : castMembers;
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function'
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}
