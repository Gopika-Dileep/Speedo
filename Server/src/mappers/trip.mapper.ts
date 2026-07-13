import { ITrip } from "../models/trip.model";
import { IGPSData } from "../models/gpsdata.model";
import { TripDTO, GPSDataDTO, TripDetailResponseDTO } from "../dtos/trip.dto";

export class TripMapper {
    static toTripDTO(trip: ITrip): TripDTO {
        return {
            id: (trip._id as any).toString(),
            tripName: trip.tripName,
            startTime: trip.startTime,
            endTime: trip.endTime,
            totalDistance: trip.totalDistance,
            totalDuration: trip.totalDuration,
            stoppageDuration: trip.stoppageDuration,
            idlingDuration: trip.idlingDuration,
            overspeedDuration: trip.overspeedDuration,
            overspeedDistance: trip.overspeedDistance,
            totalPoints: trip.totalPoints
        };
    }

    static toGPSDataDTO(gps: IGPSData): GPSDataDTO {
        return {
            latitude: gps.latitude,
            longitude: gps.longitude,
            timestamp: gps.timestamp,
            ignition: gps.ignition,
            calculatedSpeed: gps.calculatedSpeed
        };
    }

    static toTripDetailResponseDTO(trip: ITrip, gpsList: IGPSData[]): TripDetailResponseDTO {
        return {
            trip: this.toTripDTO(trip),
            gpsData: gpsList.map(gps => this.toGPSDataDTO(gps))
        };
    }
}
