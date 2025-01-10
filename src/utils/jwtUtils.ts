import jwt,{JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()


const accessSecret=process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string
const refreshSecret=process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string

class JwtUtils{
    static generateAccessToken(paylaod:object):string{
        return jwt.sign(paylaod,accessSecret,{expiresIn:'1m'})
    }

    static generateRefreshToken(paylaod:object):string{
        return jwt.sign(paylaod,refreshSecret,{expiresIn:'7d'})
    }

    static verifyToken(token:string,isRefreshToken=false): string | jwt.JwtPayload | null{
  
       try {
        const secret=isRefreshToken ? refreshSecret :accessSecret;
       
        const decoded= jwt.verify(token,secret)
        return decoded;
        
       } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error("Token has expired");
            return { message: "Token expired" }; 
          } else if (error instanceof jwt.JsonWebTokenError) {
            console.error("Invalid token signature");
          }
          
          return null;
         
       }

    }

}

export default JwtUtils