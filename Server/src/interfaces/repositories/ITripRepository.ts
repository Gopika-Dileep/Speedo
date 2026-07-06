import { IGPSData } from "../../models/gpsdata.model";
import { ITrip } from "../../models/trip.model"
import { ParsedGPSData } from '../../types/gps.types';

export interface ITripRepository {
    createTrip(data: { userId: string; tripName: string; startTime: Date; endTime: Date; 
        totalDistance?:number; totalDuration?:number; stoppageDuration?:number;idlingDuration:number;
        overspeedDuration:number;overspeedDistance?:number;totalPoints?:number;
    }): Promise<ITrip>;
    saveGPSData(tripId: string, gpsData: ParsedGPSData[]): Promise<void>
    findTripByUserId(userId:string):Promise<ITrip[]>
    findTripById(tripId:string) :Promise<ITrip| null>
    findGpsByTripId(tripId:string):Promise<IGPSData[]>
}