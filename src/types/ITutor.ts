import { ObjectId,Document } from "mongoose";


export interface ITimeSlot {
    startTime: string;
    endTime: string;
  }
  
  
 export interface IAvailability {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    slots: ITimeSlot[];
  }

export interface ITutor extends Document{
    _id:ObjectId
    name:string,
    email:string,
    phone:string,
    password:string,
    gender?: string; 
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
    status:"pending" | "approved" | "rejected";
    role: "user" | "tutor";
    timeZone:string;
    availability: IAvailability[];
    hourlyRate:number;
}