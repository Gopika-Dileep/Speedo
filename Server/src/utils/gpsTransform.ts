import { CSVGPSRow, ParsedGPSData } from "../types/gps.types";

export const transformGPSData = (
  rows: CSVGPSRow[]
): ParsedGPSData[] => {
  return rows.map((row) => ({
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    timestamp: new Date(row.timestamp),
    ignition: typeof row.ignition === "string" && (
      row.ignition.trim().toLowerCase() === "true" ||
      row.ignition.trim().toLowerCase() === "on" ||
      row.ignition.trim() === "1"
    ),
    calculatedSpeed: 0,
  }));
};