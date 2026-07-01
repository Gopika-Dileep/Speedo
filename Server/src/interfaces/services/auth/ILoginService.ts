import { IUser } from "../../../models/user.model";

export interface ILoginService{
    execute(email:string , password:string):Promise<{user:IUser,accessToken:string,refreshToken:string}>
}