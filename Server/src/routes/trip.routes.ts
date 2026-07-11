import { Router } from "express";
import upload from "../middleware/upload.middleware";
import { tripController } from "../di/trip.di";
import { authMiddleware } from "../middleware/auth.middleware";

import { ROUTES } from "../constants/routes";

export class TripRouter {
    public router: Router

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        this.router.post(ROUTES.TRIP.UPLOAD, authMiddleware, upload.single("file"), tripController.uploadTrip)
        this.router.get(ROUTES.TRIP.LIST, authMiddleware, tripController.listTrips)
        this.router.get(ROUTES.TRIP.DETAILS, authMiddleware, tripController.tripDetails)
    }
}