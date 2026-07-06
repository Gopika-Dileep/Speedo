import { Request, Response, NextFunction } from "express"
import { ITripuplaodService } from "../interfaces/services/trip/ITripuploadService"

export class TripController {
    constructor(private _tripuploadService: ITripuplaodService) { }

    uplaodTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tripName } = req.body
            await this._tripuploadService.execute(req.file!, req.userId!, tripName)
            res.status(200).json({ success: true, message: "data uplaoded succesfully" })
        } catch (error) {
            res.status(401).json({ success: false, message: error instanceof Error ? error.message : "something went wrong" })

        }
    }
}