import bcrypt from 'bcryptjs'



class PasswordUtils{

    static async hashPassword(password:string):Promise<string>{
        

        const salt=await bcrypt.genSalt(10)
        return bcrypt.hash(password,salt)
    }
    
    static async comparePassword(password:string,hashedPassword:string):Promise<boolean>{
        return bcrypt.compare(password,hashedPassword)
    }

}

export default PasswordUtils

