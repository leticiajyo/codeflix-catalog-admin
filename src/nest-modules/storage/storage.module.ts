import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud.storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';

@Global()
@Module({
  providers: [
    {
      provide: 'IStorage',
      useFactory: (configService: ConfigService) => {
        const env = configService.get('NODE_ENV');

        if (['dev', 'test', 'e2e'].includes(env)) {
          return new InMemoryStorage();
        }

        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({
          credentials,
        });
        return new GoogleCloudStorage(storage, bucket);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['IStorage'],
})
export class StorageModule {}
