import { Request, Response, NextFunction } from "express"
import { ITripuploadService } from "../interfaces/services/trip/ITripuploadService"
import { ITripsService } from "../interfaces/services/trip/ITripsService"
import { ITripdetailsService } from "../interfaces/services/trip/ITripdetailsService"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages"

export class TripController {
    constructor(private _tripuploadService: ITripuploadService, private _tripsService: ITripsService, private _tripdetailsService: ITripdetailsService) { }

    uploadTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { tripName } = req.body
            await this._tripuploadService.execute(req.file!, req.userId as string, tripName)
            res.status(200).json({ success: true, message: SUCCESS_MESSAGES.UPLOAD_SUCCESS })
        } catch (error) {
            // Using 400 Bad Request for file processing/validation failures so it doesn't trigger the 401 refresh token interceptor
            res.status(400).json({ success: false, message: error instanceof Error ? error.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG })
        }
    }

    listTrips = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this._tripsService.execute(req.userId!)
            res.status(200).json({ success: true, result })
        } catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG })
        }
    }

    tripDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tripId = req.params.tripId
            const result = await this._tripdetailsService.execute(tripId.toString(), req.userId!)
            res.status(200).json({ success: true, result })
        } catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG })
        }
    }

    deleteTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tripId = req.params.tripId
            await this._tripsService.delete(tripId.toString(), req.userId as string)
            res.status(200).json({ success: true, message: "Trip deleted successfully" })
        } catch (error) {
            res.status(500).json({ success: false, message: error instanceof Error ? error.message : ERROR_MESSAGES.SOMETHING_WENT_WRONG })
        }
    }
}