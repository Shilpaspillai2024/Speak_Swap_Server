import { ITutor } from "../../types/ITutor";

interface TutorRepository{

    createTutor(tutor:Partial<ITutor>):Promise<ITutor>
    findTutorByEmail(email:string):Promise<ITutor | null>
    findTutorById(id:string):Promise<ITutor | null>
    updateTutor(id:string,update:Partial<ITutor>):Promise<ITutor | null>

}
export default TutorRepository