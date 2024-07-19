import {
  CastMemberId,
  CastMember,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';

describe('Delete CastMember Use Case', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repository);
  });

  describe('execute', () => {
    it('should throw an error when entity is not found', async () => {
      const castMemberId = new CastMemberId();

      await expect(() =>
        useCase.execute({ id: castMemberId.id }),
      ).rejects.toThrow(new NotFoundError(castMemberId.id, CastMember));
    });

    it('should delete a castMember', async () => {
      const castMember = CastMember.fake().oneActor().build();
      await repository.insert(castMember);

      const input = {
        id: castMember.castMemberId.id,
      };

      await useCase.execute(input);

      await expect(
        repository.findById(castMember.castMemberId),
      ).resolves.toBeNull();
    });
  });
});
