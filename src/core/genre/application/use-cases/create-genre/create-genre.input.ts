import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  validateSync,
} from 'class-validator';

export type CreateGenreInputConstructorProps = {
  name: string;
  categoryIds: string[];
  isActive?: boolean;
};

export class CreateGenreInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categoryIds: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props?: CreateGenreInputConstructorProps) {
    if (!props) return;
    this.name = props.name;
    this.categoryIds = props.categoryIds;
    props.isActive && (this.isActive = props.isActive);
  }
}

export class ValidateCreateGenreInput {
  static validate(input: CreateGenreInput) {
    return validateSync(input);
  }
}
