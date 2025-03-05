import { IUser } from "../../../models/user/userModel";
import IBaseRepository from "../base/ibaseRepository";

// interface IUserRepository{
//     createUser(user:Partial<IUser>):Promise<IUser>
//     findUserByEmail(email:string):Promise<IUser | null>
//     findUserById(id:string):Promise<IUser | null>
//     updateUser(id:string,update:Partial<IUser>):Promise<IUser | null>
//     getAllUsers(page:number,limit:number,loggedInUserId:string,searchQuery:string):Promise<IUser[]>
//     updateOnlineStatus(id:string,isOnline:boolean):Promise<void>
// }

interface IUserRepository extends IBaseRepository<IUser>{
   
    findUserByEmail(email:string):Promise<IUser | null>
  

    getAllUsers(page:number,limit:number,loggedInUserId:string,searchQuery:string):Promise<IUser[]>
   
    updateOnlineStatus(id:string,isOnline:boolean):Promise<void>
}


export default IUserRepository