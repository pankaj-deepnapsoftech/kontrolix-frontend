import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    phone: undefined,
    allowedroutes: [] as string[],
    isSuper: false,
    isSupervisor: false,
    isVerified:false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userExists: (state, action)=>{
            state.id = action.payload._id;
            state.firstname = action.payload.first_name;
            state.lastname = action.payload.last_name;
            state.email = action.payload.email;
            state.phone = action.payload.phone;
            // If supervisor, give access to all modules except supervisor
            if (action.payload.isSupervisor) {
                state.allowedroutes = ["", "employee", "machine-history", "resources", "product", "machine-info", "stoppage-info", "requests", "userprofile"];
            } else if (action.payload.isSuper) {
                // Super admin has access to all routes
                state.allowedroutes = [];
            } else {
                // Employee: Only allow specific routes - Live Data, Machine History, Machine Info, Stoppage Info, Requests, My Profile
                state.allowedroutes = ["", "machine-history", "machine-info", "stoppage-info", "requests", "userprofile"];
            }
            state.isSuper = action.payload.isSuper;
            state.isSupervisor = action.payload.isSupervisor || false;
            state.isVerified = action.payload.isVerified
        },
        userNotExists: (state)=>{
            state.id = undefined;
            state.firstname = undefined;
            state.lastname = undefined;
            state.email = undefined;
            state.phone = undefined;
            state.allowedroutes = [];
            state.isSuper = false;
            state.isSupervisor = false;
            state.isVerified = false;
        }
    }
});

export default authSlice;
export const {userExists, userNotExists} = authSlice.actions;