import { ITrip } from "../../../models/trip.model";

export interface ITripsService{
    execute(userId:string):Promise<ITrip[]>
}