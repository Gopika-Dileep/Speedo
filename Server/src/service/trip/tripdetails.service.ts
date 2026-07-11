import { ITripRepository } from "../../interfaces/repositories/ITripRepository";
import { ITripdetailsService } from "../../interfaces/services/trip/ITripdetailsService";
import { TripDetailResponseDTO } from "../../dtos/trip.dto";
import { TripMapper } from "../../mappers/trip.mapper";
import { ERROR_MESSAGES } from "../../constants/messages";

export class TripDetailsService implements ITripdetailsService {
    constructor(private _tripRepo: ITripRepository) { }

    async execute(tripId: string, userId: string): Promise<TripDetailResponseDTO> {
        const trip = await this._tripRepo.findTripById(tripId);
        if (!trip) {
            throw new Error(ERROR_MESSAGES.TRIP_NOT_FOUND);
        }

        if (trip.userId.toString() !== userId) {
            throw new Error(ERROR_MESSAGES.USER_NOT_MATCHING);
        }

        const gpsData = await this._tripRepo.findGpsByTripId(tripId);

        return TripMapper.toTripDetailResponseDTO(trip, gpsData);
    }
}