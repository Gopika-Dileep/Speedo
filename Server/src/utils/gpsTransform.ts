import { CSVGPSRow, ParsedGPSData } from "../types/gps.types";

export const transformGPSData = (
  rows: CSVGPSRow[]
): ParsedGPSData[] => {
  return rows.map((row) => ({
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    timestamp: new Date(row.timestamp),
    ignition: row.ignition.toLowerCase() === "true",
    calculatedSpeed: 0,
  }));
};