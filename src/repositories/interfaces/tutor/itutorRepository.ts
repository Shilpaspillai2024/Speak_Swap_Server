import { ITutor,IAvailability } from "../../../types/ITutor";

interface ITutorRepository{

    createTutor(tutor:Partial<ITutor>):Promise<ITutor>
    findTutorByEmail(email:string):Promise<ITutor | null>
    findTutorById(id:string):Promise<ITutor | null>
    updateTutor(id:string,update:Partial<ITutor>):Promise<ITutor | null>
    setAvailability(id:string,availability:IAvailability[],timeZone:string):Promise<ITutor | null>
    deleteSlot(id:string,date:string,slotIndex:number):Promise<ITutor | null>;
    getAvailability(id:string):Promise<IAvailability[] | null>
   // getAllTutors():Promise<ITutor[]>
    searchTutors(searchQuery:string,page:number,limit:number):Promise<{tutors:ITutor[], total:number}>
    
}
export default ITutorRepository