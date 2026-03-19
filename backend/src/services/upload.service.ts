import cloudinary from '../config/cloudinary';
import { BadRequestError } from '../utils/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const uploadImage = async (
    fileBuffer: Buffer,
    mimetype: string,
    originalname: string
): Promise<{ url: string; publicId: string }> => {
    if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        throw new BadRequestError(
            'Tipo de archivo no permitido. Solo se aceptan JPG, PNG y WebP.',
            'INVALID_FILE_TYPE'
        );
    }

    const ext = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new BadRequestError(
            'Extensión de archivo no permitida. Solo se aceptan .jpg, .jpeg, .png y .webp.',
            'INVALID_FILE_EXTENSION'
        );
    }

    if (fileBuffer.byteLength > MAX_SIZE_BYTES) {
        throw new BadRequestError(
            'El archivo supera el tamaño máximo permitido de 5MB.',
            'FILE_TOO_LARGE'
        );
    }

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: 'residencia-eclat/rooms',
                    resource_type: 'image',
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(new Error(error?.message || 'Error al subir imagen a Cloudinary'));
                    }
                    resolve({ url: result.secure_url, publicId: result.public_id });
                }
            )
            .end(fileBuffer);
    });
};

export const deleteImage = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};
