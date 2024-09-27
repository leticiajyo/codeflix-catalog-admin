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
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoOutput } from '@core/video/application/common/video.output';
import { VideoPresenter } from './videos.presenter';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    const video = await this.getUseCase.execute({ id });
    return VideosController.serialize(video);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
    @Body() updateVideoDto: any,
  ) {
    const hasData = Object.keys(updateVideoDto).length > 0;

    if (hasData) {
      const data = await new ValidationPipe({
        errorHttpStatusCode: 400,
      }).transform(updateVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });

      const input = new UpdateVideoInput({ id, ...data });
      const { id: newId } = await this.updateUseCase.execute(input);
      const video = await this.getUseCase.execute({ id: newId });
      return VideosController.serialize(video);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
  ) {
    const video = await this.getUseCase.execute({ id });
    return VideosController.serialize(video);
  }

  @Patch(':id/upload')
  uploadFile(
    @UploadedFiles()
    @Body()
    data,
  ) {}

  static serialize(output: VideoOutput) {
    return new VideoPresenter(output);
  }
}
