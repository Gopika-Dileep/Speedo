import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { IRefreshService } from "../../interfaces/services/auth/IRefreshService";
import { IUser } from "../../models/user.model";
import { generateAccessToken, verifyRefreshToken } from "../../utils/token.utils";

export class RefreshService implements IRefreshService{

    constructor(private _authRepo:IAuthRepository){}
    async execute(refreshToken: string): Promise<{ user: IUser; accessToken: string; }> {
        const decoded = verifyRefreshToken(refreshToken)
        const user = await this._authRepo.findById(decoded.id);
        if(!user || user.refreshToken!==refreshToken){
            throw new Error("invalid refresh token")
        }

        const accessToken = generateAccessToken(user._id.toString() , user.name)
        return {user,accessToken}
    }
}