import mongoose, { Types } from "mongoose";
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

    async findTripByUserId(userId: string): Promise<ITrip[]> {
        return await tripModel.find({userId: new Types.ObjectId(userId)})
    }

    async findTripById(tripId: string): Promise<ITrip | null> {
        return await tripModel.findById(tripId)
    }

    async findGpsByTripId(tripId: string): Promise<IGPSData[]> {
        return await gpsdataModel.find({tripId: new Types.ObjectId(tripId)})
    }

    async deleteTrip(tripId: string): Promise<void> {
        await tripModel.findByIdAndDelete(tripId);
        await gpsdataModel.deleteMany({ tripId: new Types.ObjectId(tripId) });
    }
}