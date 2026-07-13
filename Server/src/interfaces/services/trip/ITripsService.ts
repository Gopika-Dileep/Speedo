import { TripDTO } from "../../../dtos/trip.dto";

export interface ITripsService {
    execute(userId: string): Promise<TripDTO[]>;
    delete(tripId: string, userId: string): Promise<void>;
}