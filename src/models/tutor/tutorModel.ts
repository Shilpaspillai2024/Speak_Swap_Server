
import{Schema,model}from "mongoose";
import { ITutor } from "../../types/ITutor";




const tutorSchema=new Schema<ITutor>({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
       
    },
    dob: {
        type: Date,
        
    },

    isActive:{
        type:Boolean,
        default:false
    },
    country:{
        type:String,
       
    },
    knownLanguages:{
        type:[String],
        
    },
     teachLanguage:{
        type:String,
       
    },
    otp:{
        type:String,
    },
    otpExpiration:{
        type:Date,
    },
    
    isVerified:{
        type:Boolean,
        default:false
    },
    profilePhoto:{
        type:String
    },
    certificates:{
        type:[String]
    },
    introductionVideo:{
        type:String
    }
    

   
},{timestamps:true})


const Tutor= model<ITutor>('Tutor',tutorSchema)

export {Tutor}



