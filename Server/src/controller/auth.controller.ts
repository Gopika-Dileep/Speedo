import { ILoginService } from "../interfaces/services/auth/ILoginService";
import { Request, Response, NextFunction } from 'express';
import { cookieUtils } from '../utils/cookie.utils';
import { ILogoutService } from "../interfaces/services/auth/ILogoutService";

export  class AuthController{

    constructor(private _loginService:ILoginService , private _logoutService:ILogoutService){}

    login = async (req:Request , res:Response , next:NextFunction):Promise<void> =>{
        try{
            const {email,password} = req.body
            const result = await this._loginService.execute(email, password)
            cookieUtils.setRefreshToken(res,result.refreshToken)
            res.status(200).json({success:true, user:result.user , accessToken:result.accessToken})
        }catch(error){
            res.status(401).json({success:false,message: error instanceof Error? error.message:"something went wrong"})
        }
    }

    logout = async (req:Request,res:Response , next:NextFunction):Promise<void>=>{
        try{
            const refreshToken = cookieUtils.getRefreshToken(req)
            if(refreshToken){
                await this._logoutService.execute(refreshToken)
            }
            cookieUtils.clearRefreshToken(res);
            res.status(200).json({success:true, message:"token removed"})
        }catch(error){
            res.status(401).json({success:false,message: error instanceof Error? error.message:"something went wrong"})
        }

    }

}