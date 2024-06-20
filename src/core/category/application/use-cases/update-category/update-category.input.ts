import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export type UpdateCategoryInputConstructorProps = {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
};

export class UpdateCategoryInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  constructor(props: UpdateCategoryInputConstructorProps) {
    this.id = props.id;

    props.name && (this.name = props.name);

    props.description && (this.description = props.description);

    props.isActive && (this.isActive = props.isActive);
  }
}

export class ValidateUpdateCategoryInput {
  static validate(input: UpdateCategoryInput) {
    return validateSync(input);
  }
}
