import express, { Application } from "express";
import cors from "cors"
import cookieParser from 'cookie-parser'


import { env } from "./config/env";
import { AuthRouter } from "./routes/auth.routes";
import { TripRouter } from "./routes/trip.routes";
import { connectDB } from "./config/mongoose";



import { ROUTES } from "./constants/routes";

export default class App {
    public app: Application;
    constructor() {
        this.app = express()
        this._configureMiddleware()
        this._configureRoutes();
    }
    private _configureRoutes(): void {
        this.app.get("/", (req, res) => {
            res.status(200).json({ status: "OK", message: "Server is healthy" });
        });
        this.app.use(ROUTES.AUTH.BASE, new AuthRouter().router)
        this.app.use(ROUTES.TRIP.BASE, new TripRouter().router)
    }



    private _configureMiddleware(): void {
        this.app.use(
            cors({
                origin: env.FRONTEND_URL,
                credentials: true
            })
        )
        this.app.use(cookieParser())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        
        // Lazy DB connection middleware for serverless environment
        this.app.use(async (req, res, next) => {
            try {
                await connectDB();
                next();
            } catch (err) {
                next(err);
            }
        });
    }
}