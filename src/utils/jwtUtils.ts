import jwt,{JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()


const accessSecret=process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string
const refreshSecret=process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string

class JwtUtils{
    static generateAccessToken(paylaod:object):string{
        return jwt.sign(paylaod,accessSecret,{expiresIn:'1h'})
    }

    static generateRefreshToken(paylaod:object):string{
        return jwt.sign(paylaod,accessSecret,{expiresIn:'7d'})
    }

    static verifyToken(token:string,isRefreshToken=false): string | JwtPayload | null{
  
       try {
        const secret=isRefreshToken ? refreshSecret :accessSecret;
        return jwt.verify(token,secret)
        
       } catch (error) {
          return null
       }

    }

}

export default JwtUtils