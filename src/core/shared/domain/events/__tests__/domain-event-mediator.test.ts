import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../../aggregate-root';
import { ValueObject } from '../../value-object';
import { Uuid } from '../../value-objects/uuid.vo';
import { DomainEventMediator } from '../domain-event-mediator';
import { IDomainEvent, IIntegrationEvent } from '../event.interface';

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

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  occurredOn: Date;
  eventVersion: number;
  eventName: string;
  payload: any;

  constructor(event: StubEvent) {
    this.occurredOn = new Date();
    this.eventVersion = 1;
    this.eventName = this.constructor.name;
    this.payload = event;
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

  it('should publish domain event', async () => {
    expect.assertions(1);

    mediator.register(StubEvent.name, async (event: StubEvent) => {
      expect(event.name).toBe('test');
    });

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publish(aggregate);
    await mediator.publish(aggregate);
  });

  it('should publish integration event', async () => {
    expect.assertions(4);

    mediator.register(
      StubIntegrationEvent.name,
      async (event: StubIntegrationEvent) => {
        expect(event.occurredOn).toBeInstanceOf(Date);
        expect(event.eventVersion).toBe(1);
        expect(event.eventName).toBe(StubIntegrationEvent.name);
        expect(event.payload.name).toBe('test');
      },
    );

    const aggregate = new StubAggregate();
    aggregate.action('test');
    await mediator.publishIntegrationEvents(aggregate);
  });

  it('should not publish integration event if it is not registered', () => {
    expect.assertions(1);

    const spyEmitAsync = jest.spyOn(mediator['eventEmitter'], 'emitAsync');

    const aggregate = new StubAggregate();
    aggregate.action('test');
    Array.from(aggregate.events)[0].getIntegrationEvent = undefined;

    mediator.publishIntegrationEvents(aggregate);
    expect(spyEmitAsync).not.toHaveBeenCalled();
  });
});
