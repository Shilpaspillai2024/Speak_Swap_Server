import multer from 'multer'
import path from 'path'
import { Request } from 'express'

const storage =multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../uploads'))
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`)
    },
})

const fileFilter =(req:Request,file:Express.Multer.File,cb:(error:any,acceptFile:boolean)=>void)=>{
    const allowedMimeTypes=['image/jpeg','image/png','image/gif', 'image/webp',]

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); 
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed!'), false); 
      }
}

const upload =multer({
    storage,
    fileFilter,
    limits:{
        fileSize:5*1024*1024
    },

})

export default upload