import {
  CastMember,
  CastMemberType,
} from '../../../core/cast-member/domain/cast-member.aggregate';
import { SortDirection } from '../../../core/shared/domain/repository/search-params';

const _keysInResponse = ['id', 'name', 'type', 'createdAt'];

export class GetCastMemberFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = CastMember.fake().oneActor().build();
    return [
      {
        sendData: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
      },
      {
        sendData: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const faker = CastMember.fake().oneActor().build();
    const defaultExpected = {
      statusCode: 400,
      error: 'Bad Request',
    };

    return {
      EMPTY: {
        sendData: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        sendData: {
          name: undefined,
          type: faker.type,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        sendData: {
          name: null,
          type: faker.type,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        sendData: {
          name: '',
          type: faker.type,
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      TYPE_UNDEFINED: {
        sendData: {
          name: faker.name,
          type: undefined,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_NULL: {
        sendData: {
          name: faker.name,
          type: null,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_EMPTY: {
        sendData: {
          name: faker.name,
          type: '',
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_NUMBER: {
        sendData: {
          name: faker.name,
          type: 'A',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().oneActor().withName('Member').build();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: 't'.repeat(101),
          type: faker.type,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
      TYPE_INVALID: {
        sendData: {
          name: faker.name,
          type: 10,
        },
        expected: {
          message: ['Invalid cast member type: 10'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = CastMember.fake().oneActor().withName('Member').build();
    return [
      {
        sendData: {
          name: faker.name,
          type: faker.type,
        },
        expected: {
          name: faker.name,
          type: faker.type,
        },
      },
      {
        sendData: {
          name: faker.name + ' Updated',
        },
        expected: {
          name: faker.name + ' Updated',
        },
      },
      {
        sendData: {
          type: CastMemberType.DIRECTOR,
        },
        expected: {
          type: CastMemberType.DIRECTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const faker = CastMember.fake().oneActor().withName('Member').build();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      TYPE_INVALID: {
        sendData: {
          name: faker.name,
          type: 'a',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().oneActor().withName('Member').build();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      TYPE_INVALID: {
        sendData: {
          name: faker.name,
          type: 10,
        },
        expected: {
          message: ['Invalid cast member type: 10'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = CastMember.fake()
      .manyCastMembers(4)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const arrange = [
      {
        sendData: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            currentPage: 1,
            lastPage: 1,
            perPage: 15,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 1,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const actor = CastMember.fake().oneActor();
    const director = CastMember.fake().oneDirector();
    const createdAt = new Date();
    const entitiesMap = {
      actor_a: actor
        .withName('a')
        .withCreatedAt(new Date(createdAt.getTime() + 1000))
        .build(),
      actor_AAA: actor
        .withName('AAA')
        .withCreatedAt(new Date(createdAt.getTime() + 2000))
        .build(),
      actor_AaA: actor
        .withName('AaA')
        .withCreatedAt(new Date(createdAt.getTime() + 3000))
        .build(),
      actor_b: actor
        .withName('b')
        .withCreatedAt(new Date(createdAt.getTime() + 4000))
        .build(),
      actor_c: actor
        .withName('c')
        .withCreatedAt(new Date(createdAt.getTime() + 5000))
        .build(),
      director_f: director
        .withName('f')
        .withCreatedAt(new Date(createdAt.getTime() + 6000))
        .build(),
      director_e: director
        .withName('e')
        .withCreatedAt(new Date(createdAt.getTime() + 7000))
        .build(),
    };

    const arrange_filter_by_name_sort_name_asc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_AAA, entitiesMap.actor_AaA],
          meta: {
            total: 3,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_a],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    const arrange_filter_actors_sort_by_created_desc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: 'desc' as SortDirection,
          filter: { type: CastMemberType.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_c, entitiesMap.actor_b],
          meta: {
            total: 5,
            currentPage: 1,
            lastPage: 3,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: 'desc' as SortDirection,
          filter: { type: CastMemberType.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_AaA, entitiesMap.actor_AAA],
          meta: {
            total: 5,
            currentPage: 2,
            lastPage: 3,
            perPage: 2,
          },
        },
      },
    ];

    const arrange_filter_directors_sort_by_created_desc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDirection: 'desc' as SortDirection,
          filter: { type: CastMemberType.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.director_e, entitiesMap.director_f],
          meta: {
            total: 2,
            currentPage: 1,
            lastPage: 1,
            perPage: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrange_filter_by_name_sort_name_asc,
        ...arrange_filter_actors_sort_by_created_desc,
        ...arrange_filter_directors_sort_by_created_desc,
      ],
      entitiesMap,
    };
  }
}
