import {
  CastMemberId,
  CastMemberType,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';

describe('Create CastMember Use Case', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not valid', async () => {
      const input = { name: 't'.repeat(101), type: CastMemberType.ACTOR };

      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Entity Validation Error',
      );
    });

    it('should create a castMember', async () => {
      const input = { name: 'Marc', type: CastMemberType.ACTOR };

      const output = await useCase.execute(input);

      const entity = await repository.findById(new CastMemberId(output.id));
      expect(entity).toBeDefined();

      expect(output).toStrictEqual({
        id: entity!.castMemberId.id,
        name: input.name,
        type: input.type,
        createdAt: entity!.createdAt,
      });
    });
  });
});
