import { IUser } from "../../../models/user.model";

export interface IRefreshService{
    execute(refreshToken:string):Promise<{user:IUser,accessToken:string}>
}