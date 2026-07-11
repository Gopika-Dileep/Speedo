import { Router } from "express";
import { authController } from "../di/auth.di";
import { validation } from "../middleware/validation";

import { ROUTES } from "../constants/routes";

export class AuthRouter{
    public router: Router;

    constructor(){
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes():void{
        this.router.post(ROUTES.AUTH.LOGIN, validation  ,authController.login )
        this.router.post(ROUTES.AUTH.LOGOUT , authController.logout)
        this.router.post(ROUTES.AUTH.REFRESH,authController.refresh)
    }
}