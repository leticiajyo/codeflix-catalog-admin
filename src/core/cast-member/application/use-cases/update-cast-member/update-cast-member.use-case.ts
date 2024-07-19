import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';
import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import {
  CastMemberOutputMapper,
  CastMemberOutput,
} from '../../common/cast-member.output';
import { UpdateCastMemberInput } from './update-cast-member.input';

export type UpdateCastMemberOutput = CastMemberOutput;

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);
    const castMember = await this.castMemberRepo.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    input.name && castMember.changeName(input.name);

    input.type && castMember.changeType(input.type);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}
