import { Router } from "express";
import { authController } from "../di/auth.di";
import { validation } from "../middleware/validation";

export class AuthRouter{
    public router: Router;

    constructor(){
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes():void{
        this.router.post('/login', validation  ,authController.login )
        this.router.post('/logout', validation , authController.logout)
    }
}