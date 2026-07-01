import dotenv from 'dotenv'
import {createServer, Server } from "http";
dotenv.config()
import App from "./app";

import { env } from "./config/env";
import { connectDB } from "./config/mongoose";

const appinstance = new App();

class ServerApp{
    private server: Server

    constructor(){
        this.server = createServer(appinstance.app)
    }

    public async start():Promise<void>{
        try{
            await connectDB();
            this.server.listen(env.PORT ,()=>{
                console.log("server is running")
            })
        }catch(error){
            console.log("error during setup" , error)
        }
        
    }
}

new ServerApp().start();