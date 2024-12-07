import { ObjectId,Document } from "mongoose";


export interface ITutor extends Document{
    _id:ObjectId
    name:string,
    email:string,
    phone:string,
    password:string,
    gender?: string; // Optional since not marked as required in schema
    dob?: Date;
    otp?:string;
    otpExpiration?:Date;
    isVerified:boolean;
    isActive:boolean;
    country:string;
    knownLanguages:string[];
    teachLanguage:string;
    profilePhoto:string;
    certificates:string[];
    introductionVideo:string;
    createdAt:Date;
    updatedAt:Date;

    
}