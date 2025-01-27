import { IUser } from "../../../models/user/userModel";

interface IUserRepository{
    createUser(user:Partial<IUser>):Promise<IUser>
    findUserByEmail(email:string):Promise<IUser | null>
    findUserById(id:string):Promise<IUser | null>
    updateUser(id:string,update:Partial<IUser>):Promise<IUser | null>
    getAllUsers():Promise<IUser[]>
    deleteUser(id:string):Promise<IUser | null>
}

export default IUserRepository