import { getBucket } from '~/database/firebase_setup';
// fix import for filetype
// import { fileTypeFromBuffer } from 'file-type';
import { Bucket } from '@google-cloud/storage';
import type { Express } from 'express';
import 'multer';
import logger from '~/middleware/winston';

type TMulterFile = Express.Multer.File;
type FileValidationResult = TMulterFile[] | null;

const fileTypeFromBuffer = async (
    buffer: Buffer
): Promise<{ mime: string }> => {
    logger.info('Getting file type from buffer', buffer);
    return {
        mime: 'image/jpeg',
    };
};

const maxSizes: Record<string, number> = {
    image: 5000000, // 5MB
    video: 50000000, // 50MB
};

export const validateFiles = async (
    files: Record<string, TMulterFile[]> | undefined
): Promise<FileValidationResult> => {
    if (!files) {
        return null;
    }

    const filesArray = Object.values(files).flat();
    if (!filesArray.length) {
        return null;
    }

    for (let file of filesArray) {
        if (!file) continue;
        const { mime } = (await fileTypeFromBuffer(file.buffer)) || {};

        if (!mime || (!mime.startsWith('image') && !mime.startsWith('video'))) {
            throw new Error('Invalid file type');
        }

        const fileType = mime.split('/')[0];
        if (file.size > maxSizes[fileType]) {
            throw new Error('File too large');
        }
    }

    return filesArray;
};

export const deleteImagesInPath = async (
    bucket: Bucket,
    path: string
): Promise<void> => {
    const [files] = await bucket.getFiles({ prefix: path });

    await Promise.all(
        files.map(async (file) => {
            await file.delete();
        })
    );
};

// Firebase upload
export const firebaseUpload = async (
    file: TMulterFile | null,
    path: string
): Promise<{ media: string | null; mimeType: string | null }> => {
    if (!file) {
        return {
            media: null,
            mimeType: null,
        };
    }

    const bucket = getBucket();
    const { originalname, buffer, mimetype } = file;

    if (!buffer) {
        throw new Error('No file buffer provided');
    }

    const filePath = `${path}/${originalname}`;
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
            contentType: mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err: Error) => {
            logger.error(err);
            reject(new Error('Error uploading file'));
        });

        blobStream.on('finish', async () => {
            try {
                const [signedUrl] = await blob.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2091',
                });

                // debug signed url error
                // console.log('File upload finished, URL:', signedUrl);

                resolve({ media: signedUrl, mimeType: mimetype });
            } catch (err) {
                logger.error('Error getting signed URL:', err);
                reject(new Error('Error getting signed URL'));
            }
        });

        blobStream.end(buffer);
    });
};
