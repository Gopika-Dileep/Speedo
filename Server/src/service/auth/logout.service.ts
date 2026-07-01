import { IAuthRepository } from "../../interfaces/repositories/IAuthRepository";
import { ILogoutService } from "../../interfaces/services/auth/ILogoutService";
import { verifyRefreshToken } from "../../utils/token.utils";


export class LogoutService  implements ILogoutService{

    constructor(private _authRepo:IAuthRepository){}
    async execute(refreshToken: string): Promise<void> {
        const decoded = verifyRefreshToken(refreshToken)
        await this._authRepo.updateById(decoded.id,{refreshToken:null})
        return
    }
}