import axiosInstance from "../../../api/axios";
import { uploadTripRequestSchema, tripDetailsRequestSchema } from "../schema/trip.schema";
import type { ITrip, ITripDetailResponse } from "../schema/trip.schema";

export const uploadTrip = async (file: File, name: string): Promise<{ success: boolean; message: string }> => {
    // 1. Validate request data before calling the backend
    const validated = uploadTripRequestSchema.parse({ file, tripName: name });

    const formData = new FormData();
    formData.append("file", validated.file);
    formData.append("tripName", validated.tripName);

    const response = await axiosInstance.post('/trip/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getTrips = async (): Promise<{ success: boolean; result: ITrip[] }> => {
    const response = await axiosInstance.get('/trip/trips');
    return response.data;
};

export const tripDetails = async (tripId: string): Promise<{ success: boolean; result: ITripDetailResponse }> => {
    // 2. Validate request data before calling the backend
    const validated = tripDetailsRequestSchema.parse({ tripId });

    const response = await axiosInstance.get(`/trip/tripdetails/${validated.tripId}`);
    return response.data;
};