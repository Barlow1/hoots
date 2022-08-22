import { writeAsyncIterableToWritable } from "@remix-run/node";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (
  data: AsyncIterable<Uint8Array>,
  folder: string
) => {
  const uploadPromise = new Promise<UploadApiResponse>(
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
        }
      );
      await writeAsyncIterableToWritable(data, uploadStream);
    }
  );
  return uploadPromise;
};
