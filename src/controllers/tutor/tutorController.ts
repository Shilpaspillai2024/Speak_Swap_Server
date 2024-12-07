import { Request, Response } from "express";
import TutorService from "../../services/tutor/tutorService"; 
import JwtUtils from "../../utils/jwtUtils";




class TutorController {
    private tutorService: TutorService;

    constructor(tutorService: TutorService) {
      this.tutorService = tutorService;
    }
  
    async tutorBasicDetails(req: Request, res: Response): Promise<void> {
      try {
        const { tutor, token } = await this.tutorService.tutorBasicDetails(
          req.body
        );
        res
          .status(201)
          .json({ message: "Tutor registered successfully", tutor, token });
      } catch (error) {
        let errorMessage = "an unexpected error occured";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(400).json({ error: errorMessage });
      }
    }
  
    async sendOtp(req: Request, res: Response): Promise<void> {
      try {
        const { token } = req.body;
        if (!token) {
          res.status(400).json({ error: "Token is requied" });
          return;
        }
        const response = await this.tutorService.sendOtp(token);
        res.status(200).json(response);
      } catch (error) {
        let errorMessage = "an unexpected error occured";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(400).json({ error: errorMessage });
      }
    }
  
    async verifyOtp(req: Request, res: Response): Promise<void> {
      try {
        const { token, otp } = req.body;
  
        if (!token || !otp) {
          res.status(400).json({ error: "Token and OTP are required" });
          return;
        }
  
        const tutorId = this.tutorService.verifyToken(token);
        const message = await this.tutorService.verifyOtp(tutorId, otp);
  
        res.status(200).json({ message });
      } catch (error) {
        let errorMessage = "an unexpected error occured";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(400).json({ error: errorMessage });
      }
    }
  
    async setpassword(req: Request, res: Response): Promise<void> {
      try {
        const { token, password, confirmPassword } = req.body;
  
        if (password !== confirmPassword) {
          res.status(400).json({ error: "Password do not match" });
          return;
        }
  
        const tutorId = this.tutorService.verifyToken(token);
  
        if (!tutorId) {
          console.error("Invalid or expired token");
          res.status(400).json({ error: "Invalid or expired token" });
          return;
        }
  
        const result = await this.tutorService.setPassword(tutorId, password);
        res.status(200).json({ message: "Password Set Successfully", result });
      } catch (error) {
        let errorMessage = "an unexpected error occured";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        res.status(400).json({ error: errorMessage });
      }
    }



  // Step 4: Update Tutor Profile (Handle file uploads)
  async tutorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { token, dob, gender, country, knownLanguages, teachLanguage } = req.body;
      
      if (!token || !dob || !gender || !country || !knownLanguages || !teachLanguage) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      // Explicitly type req.files as `Express.Multer.File[]`
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[] 
      };

      const uploadedFiles: {
        profilePhoto?: string;
        introductionVideo?: string;
        certificates?: string[];
      } = {
        profilePhoto: files['profilePhoto']?.[0]?.path,
        introductionVideo: files['introductionVideo']?.[0]?.path,
        certificates: files['certificates']?.map((file) => file.path),
      };

      const tutorId = this.tutorService.verifyToken(token);

      const updatedTutor = await this.tutorService.setTutorprofile(
        tutorId,
        {
          gender,
          dob,
          country,
          knownLanguages,
          teachLanguage,
        },
        uploadedFiles
      );

      res.status(200).json({
        message: "Profile updated successfully",
        updatedTutor,
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }
}

export default TutorController