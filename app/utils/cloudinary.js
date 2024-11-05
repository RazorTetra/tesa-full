// app/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file, folder, publicId = null) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const fileType = file.type;
    const base64File = `data:${fileType};base64,${base64Data}`;

    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      overwrite: true,
      invalidate: true
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64File, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};