import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '../media-file.validator';

describe('Media File Validator', () => {
  const validator = new MediaFileValidator(1024 * 1024, [
    'image/png',
    'image/jpeg',
  ]);

  describe('validate', () => {
    it('should throw an error if the file size is too large', () => {
      const data = Buffer.alloc(1024 * 1024 + 1);

      expect(() =>
        validator.validate({
          rawName: 'test.png',
          mimeType: 'image/png',
          size: data.length,
        }),
      ).toThrow(
        new InvalidMediaFileSizeError(data.length, validator['maxSize']),
      );
    });

    it('should throw an error if the file mime type is not valid', () => {
      const data = Buffer.alloc(1024);

      expect(() =>
        validator.validate({
          rawName: 'test.txt',
          mimeType: 'text/plain',
          size: data.length,
        }),
      ).toThrow(
        new InvalidMediaFileMimeTypeError(
          'text/plain',
          validator['validMimeTypes'],
        ),
      );
    });

    it('should return a valid file name', () => {
      const data = Buffer.alloc(1024);

      const { name } = validator.validate({
        rawName: 'test.png',
        mimeType: 'image/png',
        size: data.length,
      });

      expect(name).toMatch(/\.png$/);
      expect(name).toHaveLength(68);
    });
  });
});
