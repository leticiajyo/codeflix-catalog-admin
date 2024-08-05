import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import qs from 'qs';
import { CastMemberOutputMapper } from '@core/cast-member/application/common/cast-member.output';
import { ListCastMembersFixture } from 'src/nest-modules/cast-members/__tests__/cast-member-fixtures';
import { CastMembersController } from 'src/nest-modules/cast-members/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { startApp } from 'test/e2e.helper';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';

describe('CastMembersController (e2e)', () => {
  describe('/cast-members (GET)', () => {
    describe('should return cast members sorted by createdAt when request query is empty', () => {
      let castMemberRepo: CastMemberSequelizeRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } =
        ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        castMemberRepo = nestApp.app.get<CastMemberSequelizeRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('should return cast members using paginate, filter and sort', () => {
      let castMemberRepo: CastMemberSequelizeRepository;
      const nestApp = startApp();
      const { entitiesMap, arrange } = ListCastMembersFixture.arrangeUnsorted();

      beforeEach(async () => {
        castMemberRepo = nestApp.app.get<CastMemberSequelizeRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
        );
        await castMemberRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when query params is $sendData',
        async ({ sendData, expected }) => {
          const queryParams = qs.stringify(sendData as any);
          return request(nestApp.app.getHttpServer())
            .get(`/cast-members/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CastMembersController.serialize(
                    CastMemberOutputMapper.toOutput(e),
                  ),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
