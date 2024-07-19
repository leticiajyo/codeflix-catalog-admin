import {
  CastMemberId,
  CastMember,
  CastMemberType,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';

describe('Update CastMember Use Case', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const castMemberId = new CastMemberId();

      await expect(() =>
        useCase.execute({ id: castMemberId.id, name: 'fake' }),
      ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
    });

    it('should throw an error when entity is not valid', async () => {
      const entity = CastMember.fake().oneActor().build();
      repository.insert(entity);

      await expect(() =>
        useCase.execute({
          id: entity.castMemberId.id,
          name: 't'.repeat(101),
        }),
      ).rejects.toThrow('Entity Validation Error');
    });

    it('should update a castMember', async () => {
      const entity = CastMember.fake().oneActor().build();
      repository.insert(entity);

      const input = {
        id: entity.castMemberId.id,
        name: 'test',
        type: CastMemberType.DIRECTOR,
      };

      const output = await useCase.execute(input);

      expect(output).toStrictEqual({
        id: entity.castMemberId.id,
        name: input.name,
        type: input.type,
        createdAt: entity.createdAt,
      });
    });
  });
});
