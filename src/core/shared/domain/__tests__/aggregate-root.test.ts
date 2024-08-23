import { AggregateRoot } from '../aggregate-root';
import { IDomainEvent } from '../events/domain-event.interface';
import { Uuid } from '../value-objects/uuid.vo';

class StubEvent implements IDomainEvent {
  occurredOn: Date;
  eventVersion: number = 1;

  constructor(
    public aggregateId: Uuid,
    public value: string,
  ) {
    this.occurredOn = new Date();
  }
}

class StubAggregateRoot extends AggregateRoot {
  aggregateId: Uuid;
  value: string;
  copiedValue: string;

  constructor(value: string, id: Uuid) {
    super();
    this.aggregateId = id;
    this.value = value;

    this.registerHandler(StubEvent.name, this.onStubEvent.bind(this));
  }

  get entityId() {
    return this.aggregateId;
  }

  operation() {
    this.value = this.value.toUpperCase();
    this.emitEvent(new StubEvent(this.aggregateId, this.value));
  }

  onStubEvent(event: StubEvent) {
    this.copiedValue = event.value;
  }

  toJSON() {
    return {
      aggregateId: this.aggregateId,
      value: this.value,
      copiedValue: this.copiedValue,
    };
  }
}

describe('Aggregate Root', () => {
  test('should dispatch events', () => {
    const aggregate = new StubAggregateRoot('test name', new Uuid());

    aggregate.operation();

    expect(aggregate.copiedValue).toBe('TEST NAME');
  });
});
