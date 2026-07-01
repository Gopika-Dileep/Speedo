import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB():Promise<void>{
    try{
        await mongoose.connect(env.MONGO_URI)
        console.log("db connected successfully ")
    }catch(err){
        console.log(`error connecting db ${err}`);
        process.exit(1)
    }
}