import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { ILoginService } from "../../interfaces/services/auth/ILoginService";
import { IUser } from "../../models/user.model";
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from "../../utils/token.utils";


export class LoginService implements ILoginService{

    constructor(private _authRepo:IAuthRepository){}
    async execute(email: string, password: string): Promise<{user:IUser , accessToken:string , refreshToken:string}> {
        const user = await this._authRepo.findByEmail(email)
         console.log(email , user)

        if(!user){
            throw new Error ("user not found")
        }

        const isMatch = await bcrypt.compare(password , user.password)
        if(!isMatch){
            throw new Error("invalid credentials")
        }

        const accessToken = generateAccessToken(user._id.toString() , user.name)
        const refreshToken = generateRefreshToken(user._id.toString())
        await this._authRepo.updateById(user._id.toString(),{refreshToken})
        return {user,accessToken,refreshToken}
    }

}