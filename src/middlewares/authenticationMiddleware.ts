import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: string;
  token?: string;
}

interface DecodedToken {
  userId: string;
}


const authenticationMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Authentication failed. Token missing.');
    }
    const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string;
    if (!accessSecret) {
      throw new Error('JWT secret key is not set in environment variables.');
    }
    const decoded = jwt.verify(token, accessSecret) as DecodedToken;
    req.user = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).send({ error: 'Token expired. Please refresh your token.' });
    } else if (error instanceof Error) {
      res.status(401).send({ error: 'Authentication failed.' });
    } else {
      res.status(500).send({ error: 'An unexpected error occurred.' });
    }
  }
}

export default authenticationMiddleware;
