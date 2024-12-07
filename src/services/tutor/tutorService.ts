import { ITutor } from "../../types/ITutor";
import TutorRepository from "../../repositories/tutor/tutorRepository";
import EmailUtils from "../../utils/emailUtils";
import PasswordUtils from "../../utils/passwordUtils";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../../config/cloudinaryConfig";

dotenv.config();

class TutorService {
  private tutorRepository: TutorRepository;

  constructor(tutorRepository: TutorRepository) {
    this.tutorRepository = tutorRepository;
  }

  //generate jwt

  private generateToken(tutorId: string): string {
    const token = jwt.sign({ tutorId }, process.env.JWT_TOKEN_SECRET!, {
      expiresIn: "1h",
    });

    return token;
  }

  public verifyToken(token: string): string {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET!) as {
        tutorId: string;
      };
      return decoded.tutorId;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  //step 1 tutor

  async tutorBasicDetails(
    tutorDetails: Partial<ITutor>
  ): Promise<{ tutor: ITutor; token: string }> {
    const existingTutor = await this.tutorRepository.findTutorByEmail(
      tutorDetails.email!
    );
    if (existingTutor) {
      throw new Error("email already Exists");
    }

    const tutor = await this.tutorRepository.createTutor(tutorDetails);
    const token = this.generateToken(tutor._id.toString());

    return { tutor, token };
  }

  //send otp

  async sendOtp(
    token: string
  ): Promise<{ email: string; otp: string; message: string }> {
    if (!token) {
      throw new Error("token is required to send otp");
    }

    const tutorId = this.verifyToken(token);

    const tutor = await this.tutorRepository.findTutorById(tutorId);
    if (!tutor) {
      throw new Error("Tutor is not found");
    }
    //generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = new Date();

    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    tutor.otp = otp;
    tutor.otpExpiration = otpExpiration;
    await tutor.save();

    const response = await EmailUtils.sendOtp(tutor.email, otp);
    return { email: tutor.email, otp, message: "OTP sent successfully" };
  }

  //verify otp

  async verifyOtp(tutorId: string, otp: string): Promise<string> {
    const tutor = await this.tutorRepository.findTutorById(tutorId);
    if (!tutor) {
      throw new Error("Tutor not found");
    }

    if (tutor.otp !== otp) {
      throw new Error("Ivalid Otp");
    }

    if (new Date() > tutor.otpExpiration!) {
      throw new Error("otp has expired");
    }

    tutor.isVerified = true;
    tutor.otp = undefined;
    tutor.otpExpiration = undefined;
    await tutor.save();

    return "Otp verified successfully";
  }
  //step 3

  async setPassword(tutorId: string, password: string): Promise<ITutor> {
    const tutor = await this.tutorRepository.findTutorById(tutorId);
    if (!tutor || !tutor.isVerified) {
      console.error("User not found or not verified");
      throw new Error("User not found or not verified");
    }

    const hashedPassword = await PasswordUtils.hashPassword(password);
    tutor.password = hashedPassword;
    await tutor.save();
    return tutor;
  }



  async setTutorprofile(
    tutorId: string,
    details: Partial<ITutor>,
    files: {
      profilePhoto?: string;  // Change from `File` to `string`
      introductionVideo?: string;  // Change from `File` to `string`
      certificates?: string[];  // Array of strings for file paths
    }
  ): Promise<ITutor> {
    const tutor = await this.tutorRepository.findTutorById(tutorId);
    if (!tutor) {
      throw new Error("User Not found");
    }
  
    // Handle Profile Photo Upload
    if (files.profilePhoto) {
      const profilePhotoPath = files.profilePhoto; // It's now a string (file path)
      const profilePhotoResult = await cloudinary.uploader.upload(profilePhotoPath, {
        folder: "tutor/profile_photos",
        use_filename: true,
        unique_filename: true,
      });
      details.profilePhoto = profilePhotoResult.secure_url; // Save the Cloudinary URL
    }
  
    // Handle Introduction Video Upload
    if (files.introductionVideo) {
      const videoPath = files.introductionVideo; // It's now a string (file path)
      const videoResult = await cloudinary.uploader.upload(videoPath, {
        folder: "tutor/introduction_videos",
        resource_type: "video",
        use_filename: true,
        unique_filename: true,
      });
      details.introductionVideo = videoResult.secure_url;
    }
  
    // Handle Certificates Upload
    if (files.certificates && files.certificates.length > 0) {
      const certificateUrls = [];
      for (const certificate of files.certificates) {
        const certPath = certificate; // It's now a string (file path)
        const certResult = await cloudinary.uploader.upload(certPath, {
          folder: "tutor/certificates",
          use_filename: true,
          unique_filename: true,
        });
        certificateUrls.push(certResult.secure_url); // Save the Cloudinary URL
      }
      details.certificates = certificateUrls;
    }
  
    // Update tutor details
    Object.assign(tutor, details);
    await tutor.save();
    return tutor;
  }
  
}

export default TutorService;