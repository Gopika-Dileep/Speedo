import axiosIntstance from "../../../api/axios"


export const login = async (email:string , password:string) =>{
    const response = await axiosIntstance.post("/auth/login",{email,password})
    return response.data
}

export const logout = async()=>{
    const response = await axiosIntstance.post("/auth/logout")

    return response.data
}