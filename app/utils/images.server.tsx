import { writeAsyncIterableToWritable } from '@remix-run/node';
import type { UploadApiResponse} from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

export const uploadImageToCloudinary = async (
  data: AsyncIterable<Uint8Array>,
  folder: string,
) => {
  const uploadPromise = new Promise<UploadApiResponse>(
    // eslint-disable-next-line no-async-promise-executor
    async (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (result) {
            resolve(result);
          }
        },
      );
      await writeAsyncIterableToWritable(data, uploadStream);
    },
  );
  return uploadPromise;
};

export default uploadImageToCloudinary;
