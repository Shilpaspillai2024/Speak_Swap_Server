import cloudinary from '../config/cloudinaryConfig'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config();

 const uploadToCloudinary = async (
    filePath: string, 
    folder: string
  ): Promise<{ secure_url: string }> => {
    try {
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        
        transformation: [
          { width: 800, crop: "limit" }, 
          { quality: "auto" } 
        ]
      });
  
      
      fs.unlinkSync(filePath);
  
      return { secure_url: result.secure_url };
    } catch (error) {
     
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  };

  export default uploadToCloudinary;