import { TripController } from "../controller/trip.controller";
import { TripRepository } from "../repositories/trip.repository";
import { TripDetailsService } from "../service/trip/tripdetails.service";
import { TripsService } from "../service/trip/trips.service";
import { TripuploadService } from "../service/trip/tripupload.service";


const tripRepository = new TripRepository()
const tripuploadService = new TripuploadService(tripRepository)
const tripsService = new TripsService(tripRepository)
const tripdetailsService = new TripDetailsService(tripRepository)
const tripController = new TripController(tripuploadService ,tripsService,tripdetailsService)

export {tripController}