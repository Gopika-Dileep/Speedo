import { Router } from "express";
import upload from "../middleware/upload.middleware";
import { tripController } from "../di/trip.di";
import { authMiddleware } from "../middleware/auth.middleware";



export class TripRouter{
    public router :Router

    constructor(){
        this.router=Router();
        this._initializeRoutes();
    }

    private _initializeRoutes():void{
        this.router.post('/upload',authMiddleware,upload.single("file"),tripController.uplaodTrip)
    }
}