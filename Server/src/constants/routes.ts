export const ROUTES = {
    AUTH: {
        BASE: "/api/auth",
        LOGIN: "/login",
        LOGOUT: "/logout",
        REFRESH: "/refresh"
    },
    TRIP: {
        BASE: "/api/trip",
        UPLOAD: "/upload",
        LIST: "/trips",
        DETAILS: "/tripdetails/:tripId",
        DELETE: "/delete/:tripId"
    }
};
