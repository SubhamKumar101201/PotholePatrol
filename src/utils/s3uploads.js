import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3client.js';
import { s3url } from './s3url.js';
import { v4 as uuidv4 } from "uuid"; // for unique file names

const uploadMultipleFilesToS3 = async (files = []) => {
    try {
        const uploadedFiles = [];

        for (const file of files) {
            const extension = file.originalname.split(".").pop();
            const uniqueFileName = `${uuidv4()}.${extension}`;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: uniqueFileName,
                Body: file.buffer, // memory storage buffer
                ContentType: file.mimetype
            };

            const data = await s3Client.send(new PutObjectCommand(params));

            if (!data) {
                console.error(`Failed to upload ${file.originalname}`);
                continue;
            }

            uploadedFiles.push({
                publicId: uniqueFileName,
                url: s3url(uniqueFileName)
            });
        }

        return uploadedFiles;

    } catch (error) {
        console.error("Error uploading multiple files:", error);
        return null;
    }
};

export { uploadMultipleFilesToS3 };