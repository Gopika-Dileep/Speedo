import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { IUser,userModel } from "../models/user.model";


export class AuthRepository implements IAuthRepository{
    async findByEmail(email: string): Promise<IUser | null> {
        return await userModel.findOne({email})
    }
    async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return await userModel.findByIdAndUpdate(id,data,{new:true})
    }
}