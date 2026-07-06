import { IGPSData } from "../../../models/gpsdata.model"
import { ITrip } from "../../../models/trip.model"



export interface ITripDetailResponse{
    trip:ITrip,
    gpsData:IGPSData[]
}
export interface ITripdetailsService {
    execute(tripId:string , userId:string):Promise<ITripDetailResponse>
}