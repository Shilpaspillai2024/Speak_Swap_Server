import { ITutor, IAvailability } from "../../../types/ITutor";

interface ITutorService {


  tutorBasicDetails(tutorDetails: Partial<ITutor>): Promise<{ tutor: ITutor; token: string }>;

  sendOtp(token: string): Promise<{ email: string; otp: string; message: string }>;

  verifyOtp(tutorId: string, otp: string): Promise<string>;

  setPassword(tutorId: string, password: string): Promise<ITutor>;

  setTutorprofile(tutorId: string,details: Partial<ITutor>,
      files: {
        profilePhoto?: string;
        introductionVideo?: string;
        certificates?: string[];
      }
    ): Promise<ITutor> 
     
  authenticateTutor(
    email: string,
    password: string
  ): Promise<{ tutor: ITutor | null; message: string }>;


  verifyToken(token: string): string;
  sendForgotPasswordOtp(email: string): Promise<{ message: string }>;

  verifyForgotPassword(email: string, otp: string): Promise<string>;

  resetPassword(email: string, newPassword: string): Promise<ITutor>;

  getTutor(id: string): Promise<ITutor | null>;

  setAvailability(id: string, schedule: IAvailability[], timeZone: string): Promise<ITutor | null>;

  deleteSlot(id: string, day: string, slotIndex: number): Promise<ITutor | null>;

  getAvailability(id: string): Promise<IAvailability[] | null>;
}

export default ITutorService;
