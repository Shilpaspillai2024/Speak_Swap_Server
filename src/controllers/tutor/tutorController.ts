import { Request, Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
import { CustomRequest } from "../../middlewares/authMiddleware";
import ITutorService from "../../services/interfaces/tutor/itutorService";

class TutorController {
  private tutorService: ITutorService;

  constructor(tutorService: ITutorService) {
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
      const { token, dob, gender, country, knownLanguages, teachLanguage } =
        req.body;

      if (
        !token ||
        !dob ||
        !gender ||
        !country ||
        !knownLanguages ||
        !teachLanguage
      ) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const uploadedFiles: {
        profilePhoto?: string;
        introductionVideo?: string;
        certificates?: string[];
      } = {
        profilePhoto: files["profilePhoto"]?.[0]?.path,
        introductionVideo: files["introductionVideo"]?.[0]?.path,
        certificates: files["certificates"]?.map((file) => file.path),
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

  // tutor login

  async tutorLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { tutor, message } = await this.tutorService.authenticateTutor(
        email,
        password
      );

      if (!tutor) {
        if (message === "No tutor is registered with this email") {
          res.status(404).json({ message });
          return;
        }

        if (message === "Invalid password") {
          res.status(401).json({ message });
          return;
        }
        if (message === "Your account is blocked") {
          res.status(403).json({ message });
          return;
        }

        if (
          message ===
            "Your account is currently inactive. It will be activated within 48 hours." ||
          message ===
            "Your account has been rejected. Please contact support for assistance."
        ) {
          res.status(403).json({ message });
          return;
        }
      }

      const payload = { tutorId: tutor!._id, role: tutor!.role };
      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.cookie("tutorRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 60 * 60 * 1000, // 1hr
      });

      res.status(200).json({
        message: "Welcome to the tutors Dashboard",
        accessToken,
        tutor,
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  //tutor refresh token
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.tutorRefreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token missing" });
        return;
      }

      const decoded = JwtUtils.verifyToken(refreshToken, true);

      if (!decoded) {
        res.status(401).json({ message: "Invalid Refresh token" });
        return;
      }

      const payload = {
        tutorId: (decoded as { tutorId: string }).tutorId,
        role: (decoded as { role: string }).role,
      };

      const newAccessToken = JwtUtils.generateAccessToken(payload);

      console.log("new AccessToken refreshed:", newAccessToken);

      res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error in token refresh:", error);
      res.status(500).json({ message: "An unexpected error occured" });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const response = await this.tutorService.sendForgotPasswordOtp(email);
      res.status(200).json(response);
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  // Step 2: Verify OTP for password reset
  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ error: "Email and OTP are required" });
        return;
      }

      const message = await this.tutorService.verifyForgotPassword(email, otp);
      res.status(200).json({ message });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  // Step 3: Reset password after OTP verification
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "Passwords do not match" });
        return;
      }

      const user = await this.tutorService.resetPassword(email, newPassword);
      res.status(200).json({ message: "Password reset successfully", user });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  //get tutor

  async getTutor(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user;

      console.log("tutorId", tutorId);
      if (!tutorId) {
        res.status(400).json({ message: "tutor ID is required" });
        return;
      }

      const tutor = await this.tutorService.getTutor(tutorId);
      console.log("tutor", tutor);
      if (!tutor) {
        res.status(404).json({ message: "Tutor not found." });
        return;
      }

      res.status(200).json(tutor);
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async setAvailability(req: CustomRequest, res: Response): Promise<void> {
    const { tutorId } = req.params;
    console.log("tutorId", tutorId);

    const { schedule, timeZone } = req.body;
    if (!tutorId) {
      throw new Error("Tutor ID is required");
    }


   
    

    if (!timeZone || typeof timeZone !== "string") {
      throw new Error("Invalid timezone");
    }

  
    try {
      const updatedTutor = await this.tutorService.setAvailability(
        tutorId,
        schedule,
        timeZone
      );
      if (!updatedTutor) {
        res.status(404).json({ message: "Tutor not found" });
      } else {
        res.status(200).json({
          message: "Availability updated successfully",
          tutor: updatedTutor,
        });
      }
      console.log("Updated tutor availability:", updatedTutor);
    } catch (error) {
      res.status(500).json({
        message: "Failed to update availability",
        error: (error as Error).message,
      });
    }
  }

  async deleteSlot(req: CustomRequest, res: Response): Promise<void> {
    const { tutorId, date, slotIndex } = req.params;

    try {
      const updateTutor = await this.tutorService.deleteSlot(
        tutorId,
        date,
        parseInt(slotIndex)
      );
      if (!updateTutor) {
        res
          .status(404)
          .json({ message: "Tutor not found or slot not deleted." });
      } else {
        res
          .status(200)
          .json({ message: "Slot deleted successfully", tutor: updateTutor });
      }
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Failed to delete slot",
          error: (error as Error).message,
        });
    }
  }

  async getAvailability(req: CustomRequest, res: Response): Promise<void> {
    const tutorId = req.params.tutorId;

    try {
      const availability = await this.tutorService.getAvailability(tutorId);
      if (!availability) {
        res.status(404).json({ message: "Tutor not found" });
        return;
      }

      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: "something went wrong" });
    }
  }
}

export default TutorController;
