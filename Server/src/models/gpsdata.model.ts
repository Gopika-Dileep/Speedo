import mongoose, { Schema, Types, Document } from "mongoose"

export interface IGPSData extends Document {
    tripId: Types.ObjectId;
    latitude: number;
    longitude: number;
    timestamp: Date;
    ignition: boolean;
    calculatedSpeed: number;
}

const gpsDataSchema = new Schema<IGPSData>(
    {
        tripId: {
            type: Schema.Types.ObjectId,
            ref: "Trip",
            required: true
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            required: true
        },
        ignition: {
            type: Boolean,
            required: true
        },
        calculatedSpeed: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: false,
    }
)

export const gpsdataModel = mongoose.model<IGPSData>("GPSData", gpsDataSchema)