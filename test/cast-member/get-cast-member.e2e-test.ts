import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICastMemberRepository } from '../../src/core/cast-member/domain/cast-member.repository';
import { CastMember } from '../../src/core/cast-member/domain/cast-member.aggregate';
import { CastMemberOutputMapper } from '@core/cast-member/application/common/cast-member.output';
import { GetCastMemberFixture } from 'src/nest-modules/cast-members/__tests__/cast-member-fixtures';
import { CastMembersController } from 'src/nest-modules/cast-members/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { startApp } from 'test/e2e.helper';

describe('E2E Cast Members Controller', () => {
  const nestApp = startApp();
  describe('/cast-members/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'CastMember Not Found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 400,
            message: 'Validation failed (uuid is expected)',
            error: 'Bad Request',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    it('should return a cast-member ', async () => {
      const castMemberRepo = nestApp.app.get<ICastMemberRepository>(
        CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
      );
      const castMember = CastMember.fake().oneActor().build();
      await castMemberRepo.insert(castMember);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/cast-members/${castMember.castMemberId.id}`)
        .expect(200);

      const keyInResponse = GetCastMemberFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = CastMembersController.serialize(
        CastMemberOutputMapper.toOutput(castMember),
      );
      const serialized = instanceToPlain(presenter);
      expect(res.body.data).toStrictEqual(serialized);
    });
  });
});
