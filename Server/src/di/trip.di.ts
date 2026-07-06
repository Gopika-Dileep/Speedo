import { TripController } from "../controller/trip.controller";
import { TripRepository } from "../repositories/trip.repository";
import { TripuploadService } from "../service/trip/tripupload.service";


const tripRepository = new TripRepository()
const tripuploadService = new TripuploadService(tripRepository)
const tripController = new TripController(tripuploadService)

export {tripController}