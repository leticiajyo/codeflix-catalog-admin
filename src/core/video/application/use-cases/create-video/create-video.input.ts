import { Rating } from '@core/video/domain/video.aggregate';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsArray,
  IsUUID,
  Min,
  IsInt,
  validateSync,
} from 'class-validator';

export type CreateVideoInputConstructorProps = {
  title: string;
  description: string;
  yearLaunched: number;
  duration: number;
  rating: Rating;
  isOpened: boolean;
  categoryIds: string[];
  genreIds: string[];
  castMemberIds: string[];
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1900)
  @IsInt()
  @IsNotEmpty()
  yearLaunched: number;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  rating: Rating;

  @IsBoolean()
  @IsNotEmpty()
  isOpened: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categoryIds: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  genreIds: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  castMemberIds: string[];

  constructor(props?: CreateVideoInputConstructorProps) {
    if (!props) return;
    this.title = props.title;
    this.description = props.description;
    this.yearLaunched = props.yearLaunched;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isOpened = props.isOpened;
    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
  }
}

export class ValidateCreateVideoInput {
  static validate(input: CreateVideoInput) {
    return validateSync(input);
  }
}
