import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: string;
  token?: string;
}

interface DecodedToken {
  email: string;
}

const authenticationMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      return res
        .status(401)
        .send({ error: "Authentication failed Token mising" });
    }

    const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string;
    if (!accessSecret) {
      return res
        .status(500)
        .send({ error: "JWT secret key is not set in environment variables" });
    }

    const decoded = jwt.verify(token, accessSecret) as DecodedToken;
    req.user = decoded.email;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .send({ error: "Token expired. Please refersh your token" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .send({ error: "Invalid token. Authentication failed." });
    } else if (error instanceof Error) {
      return res.status(500).send({ error: "An unexpected error occurred." });
    } else {
      return res.status(500).send({ error: "An unknown error occurred." });
    }
  }
};

export default authenticationMiddleware;
