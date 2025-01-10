import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

export interface CustomRequest extends Request {
  user?: string;
  role?: string;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new Error("Authentication failed. Token missing.");
    }

    const decoded = JwtUtils.verifyToken(token);
    if (!decoded) {
       res.status(401).json({
        message: "Authentication failed. Invalid token.",
        details: "Token verification failed.",
      });
      return;
    }

    if (
      typeof decoded === "object" &&
      ("userId" in decoded || "tutorId" in decoded)
    ) {
      if ("userId" in decoded) {
        req.user = (decoded as { userId: string }).userId;
        req.role = (decoded as { role: string }).role;
      } else if ("tutorId" in decoded) {
        req.user = (decoded as { tutorId: string }).tutorId;
        req.role = (decoded as { role: string }).role;
      }

      if (!req.role) {
         res.status(403).json({
          message: "Access denied.",
          details: "Role information missing from the token.",
        });
        return
      }

      next();
    } else {
      res.status(401).json({
        message: "Authentication failed.",
        details: "Invalid token payload. Missing userId or tutorId.",
      });
      return
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(401)
      .json({
        message: "Authentication failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
};

export default authMiddleware;
