import {createSlice } from "@reduxjs/toolkit"

const initialState ={
    user:null,
    accessToken:null,
    isAuthenticated:false
}


const authSlice = createSlice({
    name :"auth",
    initialState,
    reducers:{
        setCredentials :(state ,action) =>{
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken
            state.isAuthenticated =  true;
        },

        setLogout:(state) =>{
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
        }
    }
})

export const {setCredentials , setLogout} = authSlice.actions
export default authSlice.reducer