import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../../aggregate-root';
import { ValueObject } from '../../value-object';
import { Uuid } from '../../value-objects/uuid.vo';
import { DomainEventMediator } from '../domain-event-mediator';
import { IDomainEvent } from '../event.interface';

class StubEvent implements IDomainEvent {
  occurredOn: Date;
  eventVersion: number;

  constructor(
    public aggregateId: Uuid,
    public name: string,
  ) {
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entityId(): ValueObject {
    return this.id;
  }

  action(name) {
    this.name = name;
    this.emitEvent(new StubEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}

describe('Domain Event Mediator', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  it('should publish handler', async () => {
    expect.assertions(1);

    mediator.register(StubEvent.name, async (event: StubEvent) => {
      expect(event.name).toBe('test');
    });

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publish(aggregate);
    await mediator.publish(aggregate);
  });
});
