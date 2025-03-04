import { Request, Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import IAdminService from "../../services/interfaces/admin/iadminService";
import { HttpStatus } from "../../constants/httpStatus";
import { MESSAGES } from "../../constants/message";

class AdminController {
  private adminService: IAdminService;

  constructor(adminService: IAdminService) {
    this.adminService = adminService;
  }

  async postLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message:MESSAGES.MISSING_CREDENTIALS });
        return;
      }

      const isAdmin = await this.adminService.findByEmail(email);

      console.log("isadmin ", isAdmin);
      if (!isAdmin) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message:MESSAGES.INCORRECT_EMAIL_OR_PASSWORD});
        return;
      }

      const isPassword = password === isAdmin.password;
      if (!isPassword) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message:MESSAGES.INCORRECT_PASSWORD });
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
        message:MESSAGES.LOGIN_SUCCESS,
        accessToken,
        isAdmin,
      });
    } catch (error) {
      let errorMessage =MESSAGES.UNEXPECTED_ERROR;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: errorMessage });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("Cookies:", req.cookies);

      const refreshToken = req.cookies.adminRefreshToken;
      console.log("refreshtoken:", refreshToken);

      if (!refreshToken) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message:MESSAGES.REFRESH_TOKEN_MISSING });
        return;
      }

      const decoded = JwtUtils.verifyToken(refreshToken, true);

      if (!decoded) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: MESSAGES.INVALID_REFRESH_TOKEN });
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
      res.status(500).json({ message:MESSAGES.UNEXPECTED_ERROR });
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

      res.status(HttpStatus.OK).json({ message:MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      console.error("Error in logout:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message:MESSAGES.UNEXPECTED_ERROR });
    }
  }

  // get all users
  async getAllUser(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log(req.admin);

      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message:MESSAGES.ACCESS_DENIED });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;

      const limit = parseInt(req.query.limit as string) || 10;
      const { users, totalUsers } = await this.adminService.getAllUser(
        page,
        limit
      );
      console.log("Fetched users:", users);
      res.status(HttpStatus.OK).json({
        message:MESSAGES.FETCH_USERS_SUCCESS,
        users,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message:MESSAGES.FETCH_USERS_ERROR });
    }
  }

  // block unblock user

  async blockUnblockUser(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message:MESSAGES.ACCESS_DENIED });
        return;
      }

      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message:MESSAGES.INVALID_IS_ACTIVE });
        return;
      }

      const updateStatus = await this.adminService.updateUserStatus(
        userId,
        isActive
      );

      if (!updateStatus) {
        res.status(HttpStatus.NOT_FOUND).json({ message:MESSAGES.USER_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: `User ${isActive ? "unblocked" : "blocked"} successfully.`,
        user: updateStatus,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.UNEXPECTED_ERROR });
    }
  }

  async getTutors(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message:MESSAGES.ACCESS_DENIED });
        return;
      }

      const page=parseInt(req.query.page as string) || 1;
      const limit=parseInt(req.query.limit as string) || 10;

      const {tutors,totalTutors} = await this.adminService.getTutors(page,limit);

      const totalPages=Math.ceil(totalTutors / limit)
      console.log("fetched tutors:", tutors);
      if (!tutors) {
        res.status(HttpStatus.NOT_FOUND).json({ message: MESSAGES.TUTOR_NOT_FOUND });
        return;
      }
      res
        .status(HttpStatus.OK)
        .json({ message: MESSAGES.FETCH_TUTORS_SUCCESS,
           tutors ,
           meta:{
            totalItems:totalTutors,
            totalPages,
            currentPage:page,
            itemsPerPage:limit

           }
          });
    } catch (error) {
      console.error("Error in fetching tutors:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.FETCH_TUTORS_ERROR});
    }
  }

  async getPendingTutors(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message:MESSAGES.ACCESS_DENIED });
        return;
      }

      const page=parseInt(req.query.page as string) ||1;
      const limit=parseInt(req.query.limit as string) || 10;



      const {pendingTutors,total} = await this.adminService.getPendingTutors(page,limit);

      const totalPages=Math.ceil(total/limit)

      res.status(HttpStatus.OK).json({
        message: MESSAGES.FETCH_PENDING_TUTORS_SUCCESS,
        tutors: pendingTutors,
        meta:{
          totalItems:total,
          totalPages,
          currentPage:page,
          itemsPerPage:limit
        }
      });
    } catch (error) {
      console.error("Error fetching pending tutors:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message:MESSAGES.FETCH_PENDING_TUTORS_ERROR });
    }
  }

  async pendingTutorsDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: MESSAGES.ACCESS_DENIED });
        return;
      }
      const { tutorId } = req.params;
      const pendingTutor = await this.adminService.getTutorPendingTutorById(
        tutorId
      );
      res.status(HttpStatus.OK).json({
        message:MESSAGES.FETCH_PENDING_TUTORS_SUCCESS,
        tutors: pendingTutor,
      });
    } catch (error) {
      console.error("Error fetching pending tutors:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.FETCH_PENDING_TUTORS_ERROR });
    }
  }

  async tutorVerify(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;

      const { status } = req.body;

      if (!status || !["approved", "rejected"].includes(status)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message:MESSAGES.INVALID_TUTOR_STATUS });
        return;
      }

      const isActive = status === "approved" ? true : false;

      const verifyTutor = await this.adminService.tutorVerify(
        tutorId,
        status,
        isActive
      );
      if (!verifyTutor) {
        res.status(HttpStatus.NOT_FOUND).json({ message:MESSAGES.TUTOR_NOT_FOUND });
        return;
      }
      res
        .status(HttpStatus.OK)
        .json({ message: `Tutor ${status} successfully.`, tutor: verifyTutor });
    } catch (error) {
      console.error("Error updating tutor verification:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message:MESSAGES.UNEXPECTED_ERROR });
    }
  }

  // block unblock tutor

  async blockUnblockTutor(req: CustomRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message:MESSAGES.ACCESS_DENIED});
        return;
      }

      const { tutorId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: MESSAGES.INVALID_IS_ACTIVE });
        return;
      }

      const updateStatus = await this.adminService.updateTutorStatus(
        tutorId,
        isActive
      );

      if (!updateStatus) {
        res.status(HttpStatus.NOT_FOUND).json({ message:MESSAGES.TUTOR_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: `Tutor ${isActive ? "unblocked" : "blocked"} successfully.`,
        tutor: updateStatus,
      });
    } catch (error) {
      console.error("Error updating tutor status:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message:MESSAGES.UNEXPECTED_ERROR });
    }
  }
}

export default AdminController;
