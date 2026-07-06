import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.utils";
import { userModel } from "../models/user.model";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?:string;
    }
  }
}

export const authMiddleware = async(req:Request , res:Response , next:NextFunction):Promise<void>=>{
    try{

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            res.status(401).json({sucess:false,message:"no token"})
            return;
        }
        const token = authHeader.split(' ')[1];
        if(!token) return;

        const decoded = verifyAccessToken(token)

        const user = await userModel.findById(decoded.id)
        if(!user){
            res.status(403).json({success:false , message:"user not found"})
            return 
        }

        req.userId = decoded.id
        next()
    }catch(error){
        res.status(401).json({success:false,message:"invalid token"})
    }
}