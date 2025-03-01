import mongoose, { Schema, model } from "mongoose";
import { ITutor } from "../../types/ITutor";

const availabilitySchema = new Schema({
 date:{
  type:Date,
  required:true,
 },
  slots: [
    {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
});

const tutorSchema = new Schema<ITutor>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
    },
    knownLanguages: {
      type: [String],
    },
    teachLanguage: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiration: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
    },
    certificates: {
      type: [String],
    },
    introductionVideo: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["user", "tutor"],
      default: "tutor",
    },

    timeZone:{
      type:String,
      required:true,
      default:'UTC'
    },

    availability: {
      type: [availabilitySchema],
      default: [],
    },

    hourlyRate:{
      type:Number,
      default:300  // in indian Fixed $10/hour base rate
    }
  },
  { timestamps: true }
);

const Tutor = mongoose.model<ITutor>("Tutor", tutorSchema);

export { Tutor };
