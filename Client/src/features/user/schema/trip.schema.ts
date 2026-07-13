import { z } from "zod";

// --- Request Validation Schemas ---

export const uploadTripRequestSchema = z.object({
    file: z.instanceof(File, { message: "Please select a valid file" })
        .refine((file) => file.name.toLowerCase().endsWith(".csv"), {
            message: "Only CSV files are allowed"
        }),
    tripName: z.string().min(1, "Trip name is required").trim()
});

export const uploadFormSchema = z.object({
    tripName: z.string().min(1, "Trip name is required").trim(),
    file: z.any()
        .refine((files) => files && files.length > 0, "Please select a file")
        .transform((files) => files[0] as File)
        .refine((file) => file.name.toLowerCase().endsWith(".csv"), "Only CSV files are allowed")
});

export const tripDetailsRequestSchema = z.object({
    tripId: z.string().length(24, "Invalid Trip ID format") // MongoDB ObjectIds are 24 hex characters
});


// --- Model / Response Schemas (Matching DTOs) ---

export const gpsDataSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    ignition: z.boolean(),
    calculatedSpeed: z.number()
});

export const tripSchema = z.object({
    id: z.string(),
    tripName: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    totalDistance: z.number(),
    totalDuration: z.number(),
    stoppageDuration: z.number(),
    idlingDuration: z.number(),
    overspeedDuration: z.number(),
    overspeedDistance: z.number(),
    totalPoints: z.number()
});

export const tripDetailResponseSchema = z.object({
    trip: tripSchema,
    gpsData: z.array(gpsDataSchema)
});


// --- TypeScript Type Exports ---

export type IUploadTripRequest = z.infer<typeof uploadTripRequestSchema>;
export type IUploadFormInputs = z.infer<typeof uploadFormSchema>;
export type ITripDetailsRequest = z.infer<typeof tripDetailsRequestSchema>;

export type IGPSData = z.infer<typeof gpsDataSchema>;
export type ITrip = z.infer<typeof tripSchema>;
export type ITripDetailResponse = z.infer<typeof tripDetailResponseSchema>;
