import mongoose , {Document,Schema} from "mongoose";

export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    refreshToken?:string | null;
    created_at:Date;
    updated_at:Date;
}

const userSchema = new Schema<IUser>(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String,
            default:null,
        }
    },
    {timestamps:{createdAt:"created_at" , updatedAt:"updated_at"}}
)

export const userModel = mongoose.model<IUser>('User',userSchema)