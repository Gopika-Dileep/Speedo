

export interface ITripuplaodService{
    execute(file:Express.Multer.File,userId:string,tripName:string):Promise<void>
}