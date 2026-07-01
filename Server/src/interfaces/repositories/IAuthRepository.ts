import { IUser } from "../../models/user.model"

export interface IAuthRepository{
    findByEmail(email:string):Promise<IUser | null>
    updateById(id:string,data:Partial<IUser>):Promise<IUser |null>
}