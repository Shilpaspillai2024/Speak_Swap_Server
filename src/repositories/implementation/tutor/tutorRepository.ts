import { Tutor } from "../../../models/tutor/tutorModel";
import { ITutor, IAvailability } from "../../../types/ITutor";
import ITutorRepository from "../../interfaces/tutor/itutorRepository";


class TutorRepository implements ITutorRepository {
  async createTutor(tutor: Partial<ITutor>): Promise<ITutor> {
    const newTutor = new Tutor(tutor);
    return await newTutor.save();
  }

  async findTutorByEmail(email: string): Promise<ITutor | null> {
    return await Tutor.findOne({ email });
  }

  async findTutorById(id: string): Promise<ITutor | null> {
    return await Tutor.findById(id);
  }

  async updateTutor(
    id: string,
    update: Partial<ITutor>
  ): Promise<ITutor | null> {
    return await Tutor.findByIdAndUpdate(id, update, { new: true });
  }

  async setAvailability(
    id: string,
    availability: IAvailability[],
    timeZone: string
  ): Promise<ITutor | null> {
    return await Tutor.findByIdAndUpdate(
      id,

      { $set: { availability, timeZone } },
      { new: true }
    );
  }

  async deleteSlot(
    id: string,
    date: string,
    slotIndex: number
  ): Promise<ITutor | null> {
    const tutor = await Tutor.findById(id);
    if (!tutor) {
      throw new Error("Tutor not found.");
    }

    const availability = tutor.availability.find((a) => {

      return new Date(a.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0];
    });


    if (
      !availability ||
      slotIndex < 0 ||
      slotIndex >= availability.slots.length
    ) {
      throw new Error("Invalid day or slot index.");
    }

    availability.slots.splice(slotIndex, 1); 
    tutor.availability = tutor.availability.filter((a) => a.slots.length > 0); 

    return tutor.save();
  }

  async getAvailability(id: string): Promise<IAvailability[] | null> {
    const tutor = await Tutor.findById(id).select("availability");
    if (!tutor) {
      throw new Error("Tutor not found.");
    }
    return tutor.availability;
  }

  

  async searchTutors(searchQuery: string,page:number=1,limit:number=9): Promise<{tutors:ITutor[],total:number}> {
    
    const skip=(page-1)*limit;
   
    const query: { isActive: boolean; $or?: { [key: string]: { $regex: RegExp } }[] } = {
      isActive: true,
    };
  
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      query.$or = [
        { name: { $regex: regex } },
        { teachLanguage: { $regex: regex } },
        { country: { $regex: regex } },
      ];
    }


    const [tutors, total] = await Promise.all([
      Tutor.find(query).skip(skip).limit(limit),
      Tutor.countDocuments(query)
    ]);
    
    return { tutors, total };
  }

  
}
export default TutorRepository;
