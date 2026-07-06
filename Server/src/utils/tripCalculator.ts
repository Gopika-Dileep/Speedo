import geolib from 'geolib'
import { ParsedGPSData } from '../types/gps.types'


export const calculateTripStats = (gpsData:ParsedGPSData[])=>{
    let totalDistance =0
    let stoppageDuration = 0
    let idlingDuration = 0
    let overspeedDuration = 0
    let overspeedDistance = 0 

    gpsData[0].calculatedSpeed  = 0

    for(let i = 1 ; i<gpsData.length ; i++){
        const prevPoint = gpsData[i-1]
        const currentPoint = gpsData[i]

        const distance = geolib.getDistance(
            {latitude:prevPoint.latitude , longitude:prevPoint.longitude},
            {latitude:currentPoint.latitude , longitude :currentPoint.longitude}
        )
        totalDistance +=distance;

        const timeDelta = (currentPoint.timestamp.getTime() - prevPoint.timestamp.getTime())/1000

        const speed = timeDelta >0 ? (distance/timeDelta)*3.6 :0

        currentPoint.calculatedSpeed = speed

        if(!currentPoint.ignition){
            stoppageDuration +=timeDelta;
        }else if(currentPoint.ignition && speed  ==0){
            idlingDuration+=timeDelta
        }


        if(speed>60){
            overspeedDuration += timeDelta
            overspeedDistance +=distance
        }
    }

    const totalDuration = (gpsData[gpsData.length-1].timestamp.getTime()- gpsData[0].timestamp.getTime())/1000

    return{
        totalDistance,totalDuration,stoppageDuration,idlingDuration,overspeedDuration,overspeedDistance,totalPoints:gpsData.length
    }
}