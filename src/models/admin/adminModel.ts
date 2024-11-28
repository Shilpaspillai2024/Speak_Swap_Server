import { Schema,model,Document } from "mongoose";

interface IAdmin extends Document{
    email:string;
    password:string;
}


const adminSchema=new Schema<IAdmin>({
    email:{
        type:String,
        required:true

    },
    password:{
        type:String,
        required:true
    }


})

const Admin=model<IAdmin>('Admin',adminSchema)
export{Admin,IAdmin}