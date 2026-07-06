import { Types } from "mongoose";
import { ITripRepository } from "../interfaces/repositories/ITripRepository";
import { ITrip, tripModel } from "../models/trip.model";
import { gpsdataModel, IGPSData } from "../models/gpsdata.model";
import { ParsedGPSData } from "../types/gps.types";

export class TripRepository implements ITripRepository{

    async createTrip(data: { userId:string; tripName: string; startTime: Date; endTime: Date; totalDistance?:number; totalDuration?:number; stoppageDuration?:number;idlingDuration:number;
        overspeedDuration:number;overspeedDistance?:number;totalPoints?:number;}): Promise<ITrip> {
        return await tripModel.create(data)
    }

    async saveGPSData(tripId: string, gpsData: ParsedGPSData[]): Promise<void> {
        const documents = gpsData.map(point=>({tripId,...point}))
        await gpsdataModel.insertMany(documents)
    }
}