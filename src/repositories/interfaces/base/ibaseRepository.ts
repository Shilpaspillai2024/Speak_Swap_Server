import { Document } from "mongoose";

interface IBaseRepository<T extends Document>{
    create(data:Partial<T>):Promise<T>;
    findById(id:string):Promise<T | null>;
    findByEmail?(email:string):Promise<T | null>;
    update(id: string, update: Partial<T>): Promise<T | null>;
   
}

export default IBaseRepository;