import { CreateCastMemberOutput } from '@core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { GetCastMemberOutput } from '@core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersOutput } from '@core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { UpdateCastMemberInput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.input';
import { UpdateCastMemberOutput } from '@core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CastMembersController } from '../cast-members.controller';
import {
  CastMemberPresenter,
  CastMemberCollectionPresenter,
} from '../cast-members.presenter';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import { CastMemberType } from '@core/cast-member/domain/cast-member.aggregate';

describe('CastMembers Controller', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  describe('create', () => {
    it('should execute use case', async () => {
      const output: CreateCastMemberOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Name',
        type: CastMemberType.ACTOR,
        createdAt: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['createUseCase'] = mockCreateUseCase as any;

      const input: CreateCastMemberDto = {
        name: 'Name',
        type: CastMemberType.ACTOR,
      };

      const presenter = await controller.create(input);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('update', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCastMemberOutput = {
        id,
        name: 'Name',
        type: CastMemberType.ACTOR,
        createdAt: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['updateUseCase'] = mockUpdateUseCase as any;

      const input: Omit<UpdateCastMemberInput, 'id'> = {
        name: 'Name',
        type: CastMemberType.ACTOR,
      };

      const presenter = await controller.update(id, input);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('remove', () => {
    it('should execute use case', async () => {
      const expectedOutput = undefined;
      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
      };
      controller['deleteUseCase'] = mockDeleteUseCase as any;

      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      const output = await controller.remove(id);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
      expect(expectedOutput).toStrictEqual(output);
    });
  });

  describe('findOne', () => {
    it('should execute use case', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: GetCastMemberOutput = {
        id,
        name: 'Name',
        type: CastMemberType.ACTOR,
        createdAt: new Date(),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['getUseCase'] = mockGetUseCase as any;

      const presenter = await controller.findOne(id);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('search', () => {
    it('should execute use case', async () => {
      const output: ListCastMembersOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Name',
            type: CastMemberType.ACTOR,
            createdAt: new Date(),
          },
        ],
        currentPage: 1,
        lastPage: 1,
        perPage: 1,
        total: 1,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      controller['listUseCase'] = mockListUseCase as any;
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDirection: 'desc' as SortDirection,
        filter: { name: 'test' },
      };

      const presenter = await controller.search(searchParams);

      expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toEqual(new CastMemberCollectionPresenter(output));
    });
  });
});
