import csv from "csv-parser";
import { Readable } from "stream";

export const parseCSV = <T>(
  file: Express.Multer.File
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];

    Readable.from(file.buffer)
      .pipe(csv())
      .on("data", (row) => rows.push(row as T))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};