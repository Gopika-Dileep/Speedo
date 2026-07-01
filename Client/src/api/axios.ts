import axios, { AxiosError } from 'axios'

const axiosIntstance = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    timeout:10000,
    headers:{
        "Content-Type":"application/json"
    }
})

axiosIntstance.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("accessToken");

        if(token){
            config.headers.Authorization =`Bearer ${token}`
        }

        return config
    },
    (error:AxiosError) => Promise.reject(error)
);


axiosIntstance.interceptors.response.use(
    (response)=>response,
    (error:AxiosError) =>{
        if(error.response?.status ==401){
            console.log("Unauthorized");
        }

        return Promise.reject(error)
    }
)



export default axiosIntstance