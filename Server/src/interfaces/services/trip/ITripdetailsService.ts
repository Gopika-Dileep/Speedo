import { TripDetailResponseDTO } from "../../../dtos/trip.dto";

export interface ITripdetailsService {
    execute(tripId: string, userId: string): Promise<TripDetailResponseDTO>;
}