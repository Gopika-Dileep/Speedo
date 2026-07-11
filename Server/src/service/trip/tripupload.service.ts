import { ITripuploadService } from "../../interfaces/services/trip/ITripuploadService";
import { ITripRepository } from "../../interfaces/repositories/ITripRepository";
import { parseCSV } from "../../utils/csvParser";
import { transformGPSData } from "../../utils/gpsTransform";
import { CSVGPSRow } from "../../types/gps.types";
import { calculateTripStats } from "../../utils/tripCalculator";
import { ERROR_MESSAGES } from "../../constants/messages";

export class TripuploadService implements ITripuploadService {
    constructor(private _tripRepo: ITripRepository) { }

    async execute(file: Express.Multer.File, userId: string, tripName: string): Promise<void> {
        const rows = await parseCSV(file)

        const gpsData = transformGPSData(rows as CSVGPSRow[])
        if (!gpsData || gpsData.length == 0) {
            throw new Error(ERROR_MESSAGES.NO_GPS_POINTS)
        }
        const startTime = gpsData[0].timestamp;
        const endTime = gpsData[gpsData.length - 1].timestamp

        const stats = calculateTripStats(gpsData)

        const trip = await this._tripRepo.createTrip({ userId, tripName, startTime, endTime, totalDistance: stats.totalDistance, totalDuration: stats.totalDuration, stoppageDuration: stats.stoppageDuration, idlingDuration: stats.idlingDuration, overspeedDuration: stats.overspeedDuration, overspeedDistance: stats.overspeedDistance, totalPoints: stats.totalPoints })


        await this._tripRepo.saveGPSData(trip._id.toString(), gpsData)

    }
}