import { IUser } from "../../models/user.model"

export interface IAuthRepository{
    findById(id:string):Promise<IUser|null>
    findByEmail(email:string):Promise<IUser | null>
    updateById(id:string,data:Partial<IUser>):Promise<IUser |null>
}