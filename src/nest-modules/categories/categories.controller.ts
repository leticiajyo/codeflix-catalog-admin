import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-categories/get-category.use-case';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { CategoryOutput } from '@core/category/application/common/category.output';
import { CategoryPresenter } from './categories.presenter';

@Controller('categories')
export class CategoriesController {
  @Inject(CreateCategoryUseCase)
  private createUseCase: CreateCategoryUseCase;

  @Inject(UpdateCategoryUseCase)
  private updateUseCase: UpdateCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @Inject(GetCategoryUseCase)
  private getUseCase: GetCategoryUseCase;

  @Inject(ListCategoriesUseCase)
  private listUseCase: ListCategoriesUseCase;

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const output = await this.createUseCase.execute(createCategoryDto);
    return this.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const output = await this.updateUseCase.execute({
      ...updateCategoryDto,
      id,
    });
    return this.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
  ) {
    return this.deleteUseCase.execute({ id });
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
  ) {
    const output = await this.getUseCase.execute({ id });
    return this.serialize(output);
  }

  private serialize(output: CategoryOutput) {
    return new CategoryPresenter(output);
  }
}
