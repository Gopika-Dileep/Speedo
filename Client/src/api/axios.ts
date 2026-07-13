import axios, { AxiosError } from 'axios'
import { store } from '../store/store';
import { setCredentials, setLogout } from '../store/slice/authSlice';

const axiosIntstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

axiosIntstance.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error: AxiosError) => Promise.reject(error)
);


axiosIntstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true, });

                store.dispatch(setCredentials({ user: response.data.user, accessToken: response.data.accessToken }));

                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

                return axiosIntstance(originalRequest);
            } catch (err) {
                store.dispatch(setLogout());

                return Promise.reject(err);
            }
        }

        return Promise.reject(error)
    }
)



export default axiosIntstance