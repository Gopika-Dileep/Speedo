import { AuthController } from "../controller/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginService } from "../service/auth/login.service";
import { LogoutService } from "../service/auth/logout.service";


const authRepository = new AuthRepository()
const loginService = new LoginService(authRepository)
const logoutService  = new LogoutService(authRepository)
const authController = new AuthController(loginService , logoutService)

export {
    authController
}