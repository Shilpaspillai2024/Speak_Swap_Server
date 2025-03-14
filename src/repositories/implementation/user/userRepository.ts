import { User, IUser } from "../../../models/user/userModel";
import IUserRepository from "../../interfaces/user/iuserRepository";
import BaseRepository from "../base/baseRepository";
interface IUserFilter {
  _id?: { $ne?: string } | string;
  isActive?: boolean;
  nativeLanguage?: { $regex?: string; $options?: string } | string;
}

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await User.findByIdAndUpdate(id, {
      isOnline,
      lastActive: new Date(),
    });
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 6,
    loggedInUserId: string,
    searchQuery: string = ""
  ): Promise<IUser[]> {
    const skip = (page - 1) * limit;

    const filter: IUserFilter = {
      _id: { $ne: loggedInUserId },
      isActive: true,
    };

    if (searchQuery && searchQuery.trim()) {
      filter.nativeLanguage = { $regex: searchQuery, $options: "i" };
    }

    return await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1, _id: -1 })
      .exec();
  }
}

export default UserRepository;
