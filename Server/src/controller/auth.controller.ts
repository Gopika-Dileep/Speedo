import { ILoginService } from "../interfaces/services/auth/ILoginService";
import { Request, Response, NextFunction } from 'express';
import { cookieUtils } from '../utils/cookie.utils';
import { ILogoutService } from "../interfaces/services/auth/ILogoutService";
import { IRefreshService } from "../interfaces/services/auth/IRefreshService";

export  class AuthController{

    constructor(private _loginService:ILoginService , private _logoutService:ILogoutService , private _refreshService:IRefreshService){}

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
    refresh= async (req:Request ,res:Response ,next:NextFunction):Promise<void>=>{
        try{
            const refreshToken = cookieUtils.getRefreshToken(req);
            if(!refreshToken){
                res.status(401).json({success:false, message:"no token found"})
                return
            }
            const result = await this._refreshService.execute(refreshToken)
            res.status(200).json({success:true , user:result.user , accessToken:result.accessToken})
        }catch(error){

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