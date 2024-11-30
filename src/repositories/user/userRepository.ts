import { IUser } from "../../models/user/userModel";

interface UserRepository{
    createUser(user:Partial<IUser>):Promise<IUser>
    findUserByEmail(email:string):Promise<IUser | null>
    findUserById(id:string):Promise<IUser | null>
    updateUser(id:string,update:Partial<IUser>):Promise<IUser | null>
}

export default UserRepository