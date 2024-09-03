import { Video, VideoId } from '../../../domain/video.aggregate';
import { LoadEntityError } from '../../../../shared/domain/validators/validation.error';
import { CategoryId } from '../../../../category/domain/category.aggregate';
import { GenreId } from '../../../../genre/domain/genre.aggregate';
import { CastMemberId } from '../../../../cast-member/domain/cast-member.aggregate';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from './video.model';
import { ImageMediaModel, ImageMediaRelatedField } from './image-media.model';
import {
  AudioVideoMediaModel,
  AudioVideoMediaRelatedField,
} from './audio-video-media.model';
import { Banner } from '../../../domain/banner.vo';
import { Thumbnail } from '../../../domain/thumbnail.vo';
import { ThumbnailHalf } from '../../../domain/thumbnail-half.vo';
import { Trailer } from '../../../domain/trailer.vo';
import { VideoMedia } from '../../../domain/video-media.vo';

export class VideoModelMapper {
  static toModelProps(entity: Video) {
    const {
      banner,
      thumbnail,
      thumbnailHalf,
      trailer,
      video,
      categoryIds,
      genreIds,
      castMemberIds,
      ...otherData
    } = entity.toJSON();

    return {
      ...otherData,
      imageMedias: [
        {
          media: banner,
          videoRelatedField: ImageMediaRelatedField.BANNER,
        },
        {
          media: thumbnail,
          videoRelatedField: ImageMediaRelatedField.THUMBNAIL,
        },
        {
          media: thumbnailHalf,
          videoRelatedField: ImageMediaRelatedField.THUMBNAIL_HALF,
        },
      ]
        .map((item) => {
          return item.media
            ? ImageMediaModel.build({
                videoId: entity.videoId.id,
                name: item.media.name,
                location: item.media.location,
                videoRelatedField: item.videoRelatedField as any,
              })
            : null;
        })
        .filter(Boolean),

      audioVideoMedias: [trailer, video]
        .map((audioVideoMedia, index) => {
          return audioVideoMedia
            ? AudioVideoMediaModel.build({
                videoId: entity.videoId.id,
                name: audioVideoMedia.name,
                rawLocation: audioVideoMedia.rawLocation,
                encodedLocation: audioVideoMedia.encodedLocation,
                status: audioVideoMedia.status,
                videoRelatedField:
                  index === 0
                    ? AudioVideoMediaRelatedField.TRAILER
                    : AudioVideoMediaRelatedField.VIDEO,
              } as any)
            : null;
        })
        .filter(Boolean),

      categoryIds: categoryIds.map((categoryId) =>
        VideoCategoryModel.build({
          videoId: entity.videoId.id,
          categoryId: categoryId,
        }),
      ),
      genreIds: genreIds.map((categoryId) =>
        VideoGenreModel.build({
          videoId: entity.videoId.id,
          genreId: categoryId,
        }),
      ),
      castMemberIds: castMemberIds.map((castMemberId) =>
        VideoCastMemberModel.build({
          videoId: entity.videoId.id,
          castMemberId: castMemberId,
        }),
      ),
    };
  }

  static toEntity(model: VideoModel) {
    const {
      videoId: id,
      categoryIds = [],
      genreIds = [],
      castMemberIds = [],
      imageMedias = [],
      audioVideoMedias = [],
      ...otherData
    } = model.toJSON();

    const categoriesId = categoryIds.map((c) => new CategoryId(c.categoryId));
    const genresId = genreIds.map((c) => new GenreId(c.genreId));
    const castMembersId = castMemberIds.map(
      (c) => new CastMemberId(c.castMemberId),
    );

    const bannerModel = imageMedias.find(
      (i) => i.videoRelatedField === 'banner',
    );
    const banner = bannerModel
      ? new Banner({
          name: bannerModel.name,
          location: bannerModel.location,
        })
      : null;

    const thumbnailModel = imageMedias.find(
      (i) => i.videoRelatedField === 'thumbnail',
    );
    const thumbnail = thumbnailModel
      ? new Thumbnail({
          name: thumbnailModel.name,
          location: thumbnailModel.location,
        })
      : null;

    const thumbnailHalfModel = imageMedias.find(
      (i) => i.videoRelatedField === 'thumbnail_half',
    );
    const thumbnailHalf = thumbnailHalfModel
      ? new ThumbnailHalf({
          name: thumbnailHalfModel.name,
          location: thumbnailHalfModel.location,
        })
      : null;

    const trailerModel = audioVideoMedias.find(
      (i) => i.videoRelatedField === 'trailer',
    );
    const trailer = trailerModel
      ? new Trailer({
          name: trailerModel.name,
          rawLocation: trailerModel.rawLocation,
          encodedLocation: trailerModel.encodedLocation,
          status: trailerModel.status,
        })
      : null;

    const videoModel = audioVideoMedias.find(
      (i) => i.videoRelatedField === 'video',
    );
    const videoMedia = videoModel
      ? new VideoMedia({
          name: videoModel.name,
          rawLocation: videoModel.rawLocation,
          encodedLocation: videoModel.encodedLocation,
          status: videoModel.status,
        })
      : null;

    const video = new Video({
      ...otherData,
      videoId: new VideoId(id),
      banner,
      thumbnail,
      thumbnailHalf: thumbnailHalf,
      trailer,
      video: videoMedia,
      categoryIds: new Map(categoriesId.map((c) => [c.id, c])),
      genreIds: new Map(genresId.map((c) => [c.id, c])),
      castMemberIds: new Map(castMembersId.map((c) => [c.id, c])),
    });

    if (video.notification.hasErrors()) {
      throw new LoadEntityError(video.notification.toJSON());
    }

    return video;
  }
}
