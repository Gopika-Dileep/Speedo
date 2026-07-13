

export interface ITripuploadService {
    execute(file: Express.Multer.File, userId: string, tripName: string): Promise<void>
}