import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsIn,
  validateSync,
} from 'class-validator';

export type ProcessAudioVideoMediasInputConstructorProps = {
  videoId: string;
  encodedLocation: string;
  field: 'trailer' | 'video';
  status: AudioVideoMediaStatus;
};
export class ProcessAudioVideoMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsNotEmpty()
  encodedLocation: string;

  @IsIn(['trailer', 'video'])
  @IsNotEmpty()
  field: 'trailer' | 'video';

  @IsIn([AudioVideoMediaStatus.COMPLETED, AudioVideoMediaStatus.FAILED])
  @IsNotEmpty()
  status: AudioVideoMediaStatus;

  constructor(props?: ProcessAudioVideoMediasInputConstructorProps) {
    if (!props) return;

    this.videoId = props.videoId;
    this.encodedLocation = props.encodedLocation;
    this.field = props.field;
    this.status = props.status;
  }
}
export class ValidateProcessAudioVideoMediasInput {
  static validate(input: ProcessAudioVideoMediasInput) {
    return validateSync(input);
  }
}
