import mongoose, { Schema,Types,Document } from "mongoose";

export interface ITrip extends Document{
    userId: Types.ObjectId;
    tripName: string;
    startTime: Date;
    endTime : Date;
    totalDistance :number;
    totalDuration : number;
    stoppageDuration:number;
    idlingDuration:number;
    overspeedDuration : number;
    overspeedDistance : number;
    totalPoints: number;
    createdAt : Date;
    updatedAt : Date;
}

const tripSchema = new Schema<ITrip>(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        tripName:{
            type:String,
            required:true,
        },
        startTime:{
            type:Date,
            required:true
        },
        endTime:{
            type:Date,
            required:true,
        },
        totalDistance:{
            type:Number,
            default:0,
        },
        totalDuration:{
            type:Number,
            default:0
        },
        stoppageDuration:{
            type:Number,
            default:0
        },
        idlingDuration:{
            type:Number,
            default:0
        },
        overspeedDuration:{
            type:Number,
            default:0
        },
        overspeedDistance:{
            type:Number,
            default:0
        },
        totalPoints:{
            type:Number,
            default:0,
        },
    },
    {
        timestamps: true,
    }
);

export const tripModel = mongoose.model<ITrip>("Trip",tripSchema);
