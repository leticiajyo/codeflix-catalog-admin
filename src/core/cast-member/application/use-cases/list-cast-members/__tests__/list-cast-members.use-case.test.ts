import { CastMemberOutputMapper } from '@core/cast-member/application/common/cast-member.output';
import {
  CastMember,
  CastMemberType,
} from '@core/cast-member/domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import { SortDirection } from '../../../../../shared/domain/repository/search-params';
import { setupSequelize } from '../../../../../shared/infra/testing/sequelize.helper';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';

describe('List CastMembers Use Case', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  describe('execute', () => {
    it('should return search result given paginate, sort and filter inputs', async () => {
      const categories = [
        CastMember.fake().oneActor().withName('ba').build(),
        CastMember.fake().oneActor().withName('AC').build(),
        CastMember.fake().oneActor().withName('bc').build(),
        CastMember.fake().oneDirector().withName('A').build(),
      ];
      await repository.bulkInsert(categories);

      const output = await useCase.execute({
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDirection: SortDirection.ASC,
        filter: { name: 'a', type: CastMemberType.ACTOR },
      });

      expect(output).toEqual({
        items: [categories[1], categories[0]].map(
          CastMemberOutputMapper.toOutput,
        ),
        total: 2,
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
      });
    });
  });
});
