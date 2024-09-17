import { Rating } from '@core/video/domain/video.aggregate';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  validateSync,
} from 'class-validator';

export type UpdateVideoInputConstructorProps = {
  id: string;
  title?: string;
  description?: string;
  yearLaunched?: number;
  duration?: number;
  rating?: Rating;
  isOpened?: boolean;
  categoryIds?: string[];
  genreIds?: string[];
  castMemberIds?: string[];
};

export class UpdateVideoInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Min(1900)
  @IsInt()
  @IsOptional()
  yearLaunched?: number;

  @Min(1)
  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  rating?: Rating;

  @IsBoolean()
  @IsOptional()
  isOpened?: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  genreIds?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  castMemberIds?: string[];

  constructor(props?: UpdateVideoInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    props.title && (this.title = props.title);
    props.description && (this.description = props.description);
    props.yearLaunched && (this.yearLaunched = props.yearLaunched);
    props.duration && (this.duration = props.duration);
    props.rating && (this.rating = props.rating);
    props.isOpened !== null &&
      props.isOpened !== undefined &&
      (this.isOpened = props.isOpened);
    props.categoryIds &&
      props.categoryIds.length > 0 &&
      (this.categoryIds = props.categoryIds);
    props.genreIds &&
      props.genreIds.length > 0 &&
      (this.genreIds = props.genreIds);
    props.castMemberIds &&
      props.castMemberIds.length > 0 &&
      (this.castMemberIds = props.castMemberIds);
  }
}

export class ValidateUpdateVideoInput {
  static validate(input: UpdateVideoInput) {
    return validateSync(input);
  }
}
