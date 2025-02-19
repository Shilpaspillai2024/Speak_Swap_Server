import mongoose from "mongoose";

export interface IBookingDTO {
    userId: mongoose.Types.ObjectId;
    tutorId: mongoose.Types.ObjectId;
    selectedDate: Date;
    selectedSlot: { startTime: string; endTime: string };
    sessionFee: number;
    status: "pending" | "confirmed" | "in-progress"|"completed" | "cancelled";
    paymentStatus: "paid" | "pending" | "failed" | "completed";
    bookingDate: Date;
    paymentId?: string;
    orderId?: string;
    sessionStartTime?:Date;
    sessionEndTime?:Date;
    duration?:number;
  }