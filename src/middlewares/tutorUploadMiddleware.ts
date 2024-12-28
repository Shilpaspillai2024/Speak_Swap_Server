import multer from 'multer'
import path from 'path'
import { Request } from 'express'

const tutorStorage =multer.diskStorage({

    destination:(req,file,cb)=>{
       
        cb(null,path.join(__dirname,'../uploads/tutors'))
    },
    filename:(req,file,cb)=>{
       
        cb(null,`${Date.now()}-${file.originalname}`)
    },
})

const tutorfileFilter =(req:Request,file:Express.Multer.File,cb:(error:any,acceptFile:boolean)=>void)=>{
    const allowedMimeTypes=['image/jpeg','image/png','image/gif', 'image/webp','video/mp4','application/pdf']

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); 
      } else {
        
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP  and PDFs are allowed!'), false); 
      }
}

const tutorUpload =multer({
    storage:tutorStorage,
    fileFilter:tutorfileFilter,
    limits:{
        fileSize:10*1024*1024
    },

})

export default tutorUpload