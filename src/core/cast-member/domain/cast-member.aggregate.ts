import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { AggregateRoot } from '../../shared/domain/aggregate-root';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';
import { CastMemberValidator } from './cast-member.validator';

export type CastMemberConstructorProps = {
  castMemberId: CastMemberId;
  name: string;
  type: CastMemberType;
  createdAt: Date;
};

export type CastMemberCreateCommand = {
  name: string;
  type: CastMemberType;
};

export class CastMemberId extends Uuid {}

export enum CastMemberType {
  DIRECTOR = 1,
  ACTOR = 2,
}

export class CastMember extends AggregateRoot {
  castMemberId: CastMemberId;
  name: string;
  type: CastMemberType;
  createdAt: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.castMemberId = props.castMemberId;
    this.name = props.name;
    this.type = props.type;
    this.createdAt = props.createdAt;

    this.validate();
  }

  get entityId() {
    return this.castMemberId;
  }

  static create(command: CastMemberCreateCommand) {
    const props = {
      ...command,
      castMemberId: new CastMemberId(),
      createdAt: new Date(),
    };

    return new CastMember(props);
  }

  changeName(name: string): void {
    this.name = name;
    this.validate();
  }

  changeType(type: CastMemberType): void {
    this.type = type;
  }

  validate() {
    const validator = new CastMemberValidator();
    return validator.validate(this.notification, this);
  }

  toJSON() {
    return {
      castMemberId: this.castMemberId.id,
      name: this.name,
      type: this.type,
      createdAt: this.createdAt,
    };
  }

  static fake() {
    return CastMemberFakeBuilder;
  }
}
