import cloudinary from '../config/cloudinary';

export async function uploadToCloudinary(
  fileBuffer: Buffer, 
  folder: string, 
  resourceType: 'image' | 'raw' = 'image'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sazon-patrimonial/${folder}`,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          console.error('Error subiendo a Cloudinary:', error);
          reject(new Error('Error al subir archivo'));
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}