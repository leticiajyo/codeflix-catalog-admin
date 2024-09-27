import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../../common/file-media.input';

export type UploadImageMediasInputConstructorProps = {
  videoId: string;
  field: 'banner' | 'thumbnail' | 'thumbnail_half';
  file: FileMediaInput;
};

export class UploadImageMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsIn(['banner', 'thumbnail', 'thumbnail_half'])
  @IsNotEmpty()
  field: 'banner' | 'thumbnail' | 'thumbnail_half';

  @ValidateNested()
  file: FileMediaInput;

  constructor(props?: UploadImageMediasInputConstructorProps) {
    if (!props) return;

    this.videoId = props.videoId;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediasInput {
  static validate(input: UploadImageMediasInput) {
    return validateSync(input);
  }
}
