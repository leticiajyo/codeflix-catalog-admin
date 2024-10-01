import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { GoogleCloudStorage } from '../google-cloud.storage';
import { Config } from '../../config';

// This test will not run in the test pipeline. If you want to make it run, change its name to finish with .test.ts
describe('Google Cloud Storage Integration Test', () => {
  let googleCloudStorage: GoogleCloudStorage;

  beforeEach(async () => {
    const storageSdk = new GoogleCloudStorageSdk({
      credentials: Config.googleCredentials(),
    });
    googleCloudStorage = new GoogleCloudStorage(
      storageSdk,
      Config.bucketName(),
    );
  });

  it('should store a file', async () => {
    await googleCloudStorage.store({
      data: Buffer.from('data'),
      id: 'location/1.txt',
      mimeType: 'text/plain',
    });

    const file = await googleCloudStorage.get('location/1.txt');
    expect(file.data.toString()).toBe('data');
    expect(file.mimeType).toBe('text/plain');
  }, 10000);
});
