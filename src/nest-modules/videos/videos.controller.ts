import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  ParseUUIDPipe,
  UploadedFiles,
  ValidationPipe,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoOutput } from '@core/video/application/common/video.output';
import { VideoPresenter } from './videos.presenter';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadAudioVideoMediaInput } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.input';
import { UploadImageMediasInput } from '@core/video/application/use-cases/upload-image-medias/upload-image-medias.input';
import { UploadImageMediasUseCase } from '@core/video/application/use-cases/upload-image-medias/upload-image-medias.use-case';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase;

  @Inject(UploadImageMediasUseCase)
  private uploadImageMedia: UploadImageMediasUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    const video = await this.getUseCase.execute({ id });
    return VideosController.serialize(video);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
  ) {
    const video = await this.getUseCase.execute({ id });
    return VideosController.serialize(video);
  }

  /*
  We could have a specific endpoint for file upload, but the update video function handles a multipart/form-data
  request with both the file and a body for educational purposes. Ideally, we'd have a separate endpoint and follow
  the SRP.
  */
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
    @Body() updateVideoDto: any,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnailHalf?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasData = Object.keys(updateVideoDto).length > 0;
    const hasFiles = files ? Object.keys(files).length : false;

    if (hasFiles && hasData) {
      throw new BadRequestException('Files and data cannot be sent together');
    }

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 400,
      }).transform(updateVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });

      const input = new UpdateVideoInput({ id, ...data });
      await this.updateUseCase.execute(input);
    } else {
      const hasMoreThanOneFile = Object.keys(files).length > 1;

      if (hasMoreThanOneFile) {
        throw new BadRequestException('Only one file can be sent at a time');
      }

      const hasAudioVideoMedia = files.trailer?.length || files.video?.length;

      const fieldField = Object.keys(files)[0];
      const file = files[fieldField][0];

      if (hasAudioVideoMedia) {
        await this.handleMediaUpload(
          id,
          file,
          fieldField,
          UploadAudioVideoMediaInput,
          this.uploadAudioVideoMedia.execute.bind(this.uploadAudioVideoMedia),
        );
      } else {
        await this.handleMediaUpload(
          id,
          file,
          fieldField,
          UploadImageMediasInput,
          this.uploadImageMedia.execute.bind(this.uploadImageMedia),
        );
      }
    }

    const video = await this.getUseCase.execute({ id });
    return VideosController.serialize(video);
  }

  async handleMediaUpload<T>(
    id: string,
    file: any,
    fieldField: any,
    inputType: new () => T,
    useCase: (input: T) => Promise<void>,
  ) {
    const dto = {
      videoId: id,
      field: fieldField as any,
      file: {
        rawName: file.originalname,
        data: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
      },
    };

    const input = await new ValidationPipe({
      errorHttpStatusCode: 400,
    }).transform(dto, {
      metatype: inputType,
      type: 'body',
    });

    await useCase(input);
  }

  static serialize(output: VideoOutput) {
    return new VideoPresenter(output);
  }
}
