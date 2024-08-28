import { VideoFakeBuilder } from '../video-fake.builder';

describe('Video Validator', () => {
  it('should validate video name', () => {
    const video = VideoFakeBuilder.oneVideoWithoutMedias()
      .withTitle('t'.repeat(256))
      .build();

    expect(video.notification.hasErrors()).toBe(true);
    expect(video.notification).notificationContainsErrorMessages([
      {
        title: ['title must be shorter than or equal to 255 characters'],
      },
    ]);
  });
});
