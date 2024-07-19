import {
  CastMemberId,
  CastMember,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';

describe('Get CastMember Use Case', () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetCastMemberUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const castMemberId = new CastMemberId();

      await expect(() =>
        useCase.execute({ id: castMemberId.id }),
      ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
    });

    it('should return a castMember', async () => {
      const castMember = CastMember.fake().oneDirector().build();
      await repository.insert(castMember);

      const output = await useCase.execute({ id: castMember.castMemberId.id });

      expect(output).toStrictEqual({
        id: castMember.castMemberId.id,
        name: castMember.name,
        type: castMember.type,
        createdAt: castMember.createdAt,
      });
    });
  });
});
