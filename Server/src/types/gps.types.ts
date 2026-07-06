export interface CSVGPSRow {
  latitude: string;
  longitude: string;
  timestamp: string;
  ignition: string;
}

export interface ParsedGPSData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  ignition: boolean;
  calculatedSpeed: number;
}