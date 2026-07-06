import { ITripRepository } from "../../interfaces/repositories/ITripRepository";
import { ITripsService } from "../../interfaces/services/trip/ITripsService";
import { ITrip } from "../../models/trip.model";


export class TripsService implements ITripsService{
    constructor(private _tripRepo:ITripRepository){}

    async execute(userId: string): Promise<ITrip[]> {
        
        const trips = await this._tripRepo.findTripByUserId(userId)
        return trips
        
    }
}