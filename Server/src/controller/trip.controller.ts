import { Request, Response, NextFunction } from "express"
import { ITripuplaodService } from "../interfaces/services/trip/ITripuploadService"
import { ITripsService } from "../interfaces/services/trip/ITripsService"
import { ITripdetailsService } from "../interfaces/services/trip/ITripdetailsService"

export class TripController {
    constructor(private _tripuploadService: ITripuplaodService , private _tripsService:ITripsService , private _tripdetailsService:ITripdetailsService) { }

    uplaodTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tripName } = req.body
            await this._tripuploadService.execute(req.file!, req.userId!, tripName)
            res.status(200).json({ success: true, message: "data uplaoded succesfully" })
        } catch (error) {
            res.status(401).json({ success: false, message: error instanceof Error ? error.message : "something went wrong" })

        }
    }

    listTrips = async (req:Request , res:Response , next:NextFunction):Promise<void>=>{
        try{

            const result = await this._tripsService.execute(req.userId!)
            res.status(200).json({success:false, result})

        }catch(error){
            res.status(401).json({success:false,message: error instanceof Error ? error.message : "something went wrong"})
        }
    }

    tripDetails = async ( req:Request , res:Response , next:NextFunction):Promise<void> =>{
        try{
            const tripId = req.params.tripId
            const result = await this._tripdetailsService.execute(tripId.toString(),req.userId!)
            res.status(200).json({succes:true , result})
        }catch(error){
            res.status(401).json({success:false,message: error instanceof Error ? error.message : "something went wrong"})
        }
    }
}