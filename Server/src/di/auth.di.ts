import { AuthController } from "../controller/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginService } from "../service/auth/login.service";
import { LogoutService } from "../service/auth/logout.service";
import { RefreshService } from "../service/auth/refresh.service";


const authRepository = new AuthRepository()
const loginService = new LoginService(authRepository)
const logoutService  = new LogoutService(authRepository)
const refreshService = new RefreshService(authRepository)
const authController = new AuthController(loginService , logoutService,refreshService)

export {
    authController
}