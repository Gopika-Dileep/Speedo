import { ITripRepository } from "../../interfaces/repositories/ITripRepository";
import { ITripDetailResponse, ITripdetailsService } from "../../interfaces/services/trip/ITripdetailsService";

 

 export class TripDetailsService implements ITripdetailsService{
        constructor(private _tripRepo:ITripRepository){}

        async execute(tripId: string, userId: string): Promise<ITripDetailResponse> {
            const trip = await this._tripRepo.findTripById(tripId)
            if(!trip){
                throw new Error("trip not found")
            }

            if(trip.userId.toString()!==userId){
                throw new Error("user not matching")
            }

            const gpsData = await this._tripRepo.findGpsByTripId(tripId)

            return {trip , gpsData}
        }

 }