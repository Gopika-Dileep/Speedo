import { z } from "zod";

// 1. Zod Schemas for DTOs
export const tripDTOSchema = z.object({
    id: z.string(),
    tripName: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    totalDistance: z.number(),
    totalDuration: z.number(),
    stoppageDuration: z.number(),
    idlingDuration: z.number(),
    overspeedDuration: z.number(),
    overspeedDistance: z.number(),
    totalPoints: z.number()
});

export const gpsDataDTOSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.date(),
    ignition: z.boolean(),
    calculatedSpeed: z.number()
});

export const tripDetailResponseDTOSchema = z.object({
    trip: tripDTOSchema,
    gpsData: z.array(gpsDataDTOSchema)
});

// 2. Types inferred from schemas
export type TripDTO = z.infer<typeof tripDTOSchema>;
export type GPSDataDTO = z.infer<typeof gpsDataDTOSchema>;
export type TripDetailResponseDTO = z.infer<typeof tripDetailResponseDTOSchema>;
