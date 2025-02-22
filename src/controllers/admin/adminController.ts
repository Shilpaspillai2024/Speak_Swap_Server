import { Request, Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import IAdminService from "../../services/interfaces/admin/iadminService";
import { HttpStatus } from "../../constants/httpStatus";

class AdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  async postLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Missing credentials" });
        return;
      }

      const isAdmin = await this.adminService.findByEmail(email);

      console.log("isadmin ", isAdmin);
      if (!isAdmin) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Incorrect email or password" });
        return;
      }

      const isPassword = password === isAdmin.password;
      if (!isPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "incorrect password" });
        return;
      }

      const payload = { email: isAdmin.email, role: isAdmin.role };
      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days,
        path: "/",
      });
      // Log the cookie being set
      console.log("Setting refresh token cookie:", {
        token: refreshToken,
        options: {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      });

      res.status(HttpStatus.OK).json({
        message: "Login SuccessFull",
        accessToken,
        isAdmin,
      });
    } catch (error) {
      let errorMessage = "An unexpected error Occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: errorMessage });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("Cookies:", req.cookies);

      const refreshToken = req.cookies.adminRefreshToken;
      console.log("refreshtoken:", refreshToken);

      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Refresh token missing" });
        return;
      }

      const decoded = JwtUtils.verifyToken(refreshToken, true);

      if (!decoded) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid Refresh token" });
        return;
      }
      const payload = {
        email: (decoded as { email: string }).email,
        role: (decoded as { role: string }).role,
      };

      const newAccessToken = JwtUtils.generateAccessToken(payload);

      console.log("new AccessToken refreshed:", newAccessToken);

      res.status(HttpStatus.OK).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Error in token refresh:", error);
      res.status(500).json({ message: "An unexpected error occured" });
    }
  }

  async logoutAdmin(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("adminRefreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      res.status(HttpStatus.OK).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error in logout:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "An unexpected error occurred during logout" });
    }
  }

  // get all users
  async getAllUser(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log(req.admin);

      if (!req.admin) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
        return;
      }
      const users = await this.adminService.getAllUser();
      console.log("Fetched users:", users);
      res.status(HttpStatus.OK).json({ message: "Users fetched successfully", users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "fetch user details error" });
    }
  }

  // block unblock user

  async blockUnblockUser(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
        return;
      }

      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Invalid 'isActive' value. Must be a boolean." });
        return;
      }

      const updateStatus = await this.adminService.updateUserStatus(
        userId,
        isActive
      );

      if (!updateStatus) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: `User ${isActive ? "unblocked" : "blocked"} successfully.`,
        user: updateStatus,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
  }

  async getTutors(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied admins only" });
        return;
      }

      const tutor = await this.adminService.getTutors();
      console.log("fetched tutors:", tutor);
      if (!tutor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "No tutors found" });
        return;
      }
      res.status(HttpStatus.OK).json({ message: " tutors fetched Successfully", tutor });
    } catch (error) {
      console.error("Error in fetching tutors:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "failed to fetch tutor details" });
    }
  }

  async getPendingTutors(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
        return;
      }
      const pendingTutors = await this.adminService.getPendingTutors();
      res
        .status(HttpStatus.OK)
        .json({
          message: "pending tutors fetched successfully",
          tutors: pendingTutors,
        });
    } catch (error) {
      console.error("Error fetching pending tutors:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch pending tutors" });
    }
  }

  async tutorVerify(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;

      const { status } = req.body;

      if (!status || !["approved", "rejected"].includes(status)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Invalid status only approved or rejected" });
        return;
      }

      const isActive = status === "approved" ? true : false;

      const verifyTutor = await this.adminService.tutorVerify(
        tutorId,
        status,
        isActive
      );
      if (!verifyTutor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Tutor not found." });
        return;
      }
      res
        .status(HttpStatus.OK)
        .json({ message: `Tutor ${status} successfully.`, tutor: verifyTutor });
    } catch (error) {
      console.error("Error updating tutor verification:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
  }

  // block unblock tutor

  async blockUnblockTutor(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
        return;
      }

      const { tutorId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Invalid 'isActive' value. Must be a boolean." });
        return;
      }

      const updateStatus = await this.adminService.updateTutorStatus(
        tutorId,
        isActive
      );

      if (!updateStatus) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Tutor not found." });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: `Tutor ${isActive ? "unblocked" : "blocked"} successfully.`,
        tutor: updateStatus,
      });
    } catch (error) {
      console.error("Error updating tutor status:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
    }
  }
}

export default AdminController;
