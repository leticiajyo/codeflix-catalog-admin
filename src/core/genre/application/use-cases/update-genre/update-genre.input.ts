import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  validateSync,
} from 'class-validator';

export type UpdateGenreInputConstructorProps = {
  id: string;
  name?: string;
  categoryIds?: string[];
  isActive?: boolean;
};

export class UpdateGenreInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props?: UpdateGenreInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    props.name && (this.name = props.name);
    props.categoryIds &&
      props.categoryIds.length > 0 &&
      (this.categoryIds = props.categoryIds);
    props.isActive !== null &&
      props.isActive !== undefined &&
      (this.isActive = props.isActive);
  }
}

export class ValidateUpdateGenreInput {
  static validate(input: UpdateGenreInput) {
    return validateSync(input);
  }
}
