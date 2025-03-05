import { Model,Document } from "mongoose";
import mongoose from "mongoose";
import IBaseRepository from "../../interfaces/base/ibaseRepository";

class BaseRepository<T extends Document> implements IBaseRepository<T>{

    protected model:Model<T>;

    constructor(model:Model<T>){
        this.model=model;
    }

    async create(data: Partial<T>): Promise<T> {
        const newDocument=new this.model(data);
        return await newDocument.save();
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id)
    }

    async findByEmail(email: string): Promise<T | null> {
        return await this.model.findOne({email})
    }

    async update(id: string, update: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id,update,{new :true})
    }

}

export default BaseRepository;