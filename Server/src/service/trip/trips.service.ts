import { ITripRepository } from "../../interfaces/repositories/ITripRepository";
import { ITripsService } from "../../interfaces/services/trip/ITripsService";
import { TripDTO } from "../../dtos/trip.dto";
import { TripMapper } from "../../mappers/trip.mapper";

export class TripsService implements ITripsService {
    constructor(private _tripRepo: ITripRepository) { }

    async execute(userId: string): Promise<TripDTO[]> {
        const trips = await this._tripRepo.findTripByUserId(userId);
        return trips.map(trip => TripMapper.toTripDTO(trip));
    }

    async delete(tripId: string, userId: string): Promise<void> {
        const trip = await this._tripRepo.findTripById(tripId);
        if (!trip) {
            throw new Error("Trip not found");
        }
        if (trip.userId.toString() !== userId) {
            throw new Error("Unauthorized to delete this trip");
        }
        await this._tripRepo.deleteTrip(tripId);
    }
}