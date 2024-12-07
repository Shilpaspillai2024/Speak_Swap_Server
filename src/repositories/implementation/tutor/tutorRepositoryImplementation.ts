import { Tutor } from "../../../models/tutor/tutorModel";
import { ITutor } from "../../../types/ITutor";
import TutorRepository from "../../tutor/tutorRepository";

class TutorRepositoryImplemenation implements TutorRepository{

    async createTutor(tutor: Partial<ITutor>): Promise<ITutor> {
        const newTutor=new Tutor(tutor);
        return await newTutor.save()
      }
  
      async findTutorByEmail(email: string): Promise<ITutor | null> {
         
          return await Tutor.findOne({email})
      }
  
      async findTutorById(id: string): Promise<ITutor | null> {
          return await Tutor.findById(id)
      }
  
  
      async updateTutor(id: string, update: Partial<ITutor>): Promise<ITutor | null> {
          return await Tutor.findByIdAndUpdate(id,update,{new:true})
      }
  

}
export default TutorRepositoryImplemenation