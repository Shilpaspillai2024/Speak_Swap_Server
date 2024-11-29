import { Schema,model,Document } from "mongoose";

interface IUser extends Document{
    fullName:string;
    email:string;
    password:string;
    phone:string;
    isActive:boolean;
    continent:string;
    country:string;
    language:string;
    proficiency:string;
    knownLanguages:String;
    learnLanguage:string;
    learnProficiency:string;
    talkAbout:string;
    learningGoal:string;
    whyChat:string;
    profilePhoto:string;
    otp?:string;
    otpExpiration?:Date;
    

}

const userSchema =new Schema<IUser>({
    fullName:{
        type:String,
       required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        
    },
    phone:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
       
        default:false
    },
    continent:{
        type:String,
       
    },
    country:{
        type:String,
       
    },
    language:{
        type:String,
        
    },
    proficiency:{
        type:String,
       
    },

    knownLanguages:{
        type:[String],
       
    },

    learnLanguage:{
        type:String,
       
    },
    learnProficiency:{
        type:String,
       
    },
    talkAbout:{
        type:String,
      
    },
    learningGoal:{
        type:String,
        
    },
    whyChat:{
        type:String,
       
    },
    profilePhoto:{
        type:String,
       
    },
    otp:{
        type:String,
    },
    otpExpiration:{
        type:Date,
    },

})


const User =model<IUser>('User',userSchema)

export {User,IUser}
