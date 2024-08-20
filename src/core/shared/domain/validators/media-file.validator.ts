import crypto from 'crypto';

export class MediaFileValidator {
  constructor(
    private readonly maxSize: number,
    private readonly validMimeTypes: string[],
  ) {}

  validate({
    rawName,
    mimeType,
    size,
  }: {
    rawName: string;
    size: number;
    mimeType: string;
  }) {
    if (!this.isSizeValid(size)) {
      throw new InvalidMediaFileSizeError(size, this.maxSize);
    }

    if (!this.isMimeTypeValid(mimeType)) {
      throw new InvalidMediaFileMimeTypeError(mimeType, this.validMimeTypes);
    }

    return {
      name: this.generateRandomName(rawName),
    };
  }

  private isSizeValid(size: number) {
    return size <= this.maxSize;
  }

  private isMimeTypeValid(mimeType: string) {
    return this.validMimeTypes.includes(mimeType);
  }

  private generateRandomName(rawName: string) {
    const extension = rawName.split('.').pop();

    return (
      crypto
        .createHash('sha256')
        .update(rawName + Math.random() + Date.now())
        .digest('hex') +
      '.' +
      extension
    );
  }
}

export class InvalidMediaFileSizeError extends Error {
  constructor(actualSize: number, maxSize: number) {
    super(`Invalid media file size: ${actualSize} > ${maxSize}`);
  }
}

export class InvalidMediaFileMimeTypeError extends Error {
  constructor(actualMimeType: string, validMimeTypes: string[]) {
    super(
      `Invalid media file mime type: ${actualMimeType} not in ${validMimeTypes.join(
        ', ',
      )}`,
    );
  }
}
