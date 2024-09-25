import { Global, Module, Scope } from '@nestjs/common';
import { SequelizeModule, getConnectionToken } from '@nestjs/sequelize';
import { CategoryModel } from '../../core/category/infra/db/sequelize/category.model';
import { ConfigService } from '@nestjs/config';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config/config.module';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Sequelize } from 'sequelize';
import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member.model';
import {
  GenreModel,
  GenreCategoryModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { AudioVideoMediaModel } from '@core/video/infra/db/sequelize/audio-video-media.model';
import { ImageMediaModel } from '@core/video/infra/db/sequelize/image-media.model';
import {
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
} from '@core/video/infra/db/sequelize/video.model';

const models = [
  CategoryModel,
  GenreModel,
  GenreCategoryModel,
  CastMemberModel,
  VideoModel,
  VideoCategoryModel,
  VideoCastMemberModel,
  VideoGenreModel,
  ImageMediaModel,
  AudioVideoMediaModel,
];

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');
        if (dbVendor === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        if (dbVendor === 'mysql') {
          return {
            dialect: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            database: configService.get('DB_DATABASE'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            models,
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        throw new Error(`Unsupported database configuration: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
