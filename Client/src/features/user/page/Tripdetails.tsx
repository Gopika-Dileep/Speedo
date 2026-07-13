import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { tripDetails } from "../api/userapi";
import type { ITripDetailResponse } from "../schema/trip.schema";

export default function Tripdetails() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [tripData, setTripData] = useState<ITripDetailResponse[]>([])
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const [gpsPage, setGpsPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        const fetchAllSelectedTrips = async () => {
            const idsQuery = searchParams.get("ids");
            if (!idsQuery) {
                setIsLoading(false);
                return;
            }

            const ids = idsQuery.split(",");
            setIsLoading(true);
            try {
                const promises = ids.map(id => tripDetails(id));
                const results = await Promise.all(promises);
                const successfulTrips = results
                    .filter(res => res.success)
                    .map(res => res.result);

                setTripData(successfulTrips);

                if (successfulTrips.length > 0) {
                    setActiveTripId(successfulTrips[0].trip.id);
                }
            } catch (error) {
                console.error("Error fetching trip details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllSelectedTrips();
    }, [searchParams]);

    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        if (tripData.length === 0) return;

        const map = L.map("map");
        mapInstance.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Different colors for each selected trip
        const baseColors = ["#0047FF", "#EAB308", "#A855F7", "#22C55E"];
        const allCoordinates: L.LatLngExpression[] = [];

        tripData.forEach((tripDetail, index) => {
            const { gpsData } = tripDetail;
            const tripColor = baseColors[index % baseColors.length];

            for (let i = 1; i < gpsData.length; i++) {
                const prev = gpsData[i - 1];
                const curr = gpsData[i];

                const prevLatLng: L.LatLngExpression = [prev.latitude, prev.longitude];
                const currLatLng: L.LatLngExpression = [curr.latitude, curr.longitude];

                allCoordinates.push(currLatLng);

                const isOverspeeding = curr.calculatedSpeed > 60;

                L.polyline([prevLatLng, currLatLng], {
                    color: isOverspeeding ? "#00FFFF" : tripColor,
                    weight: isOverspeeding ? 6 : 4,
                    opacity: 0.8
                }).addTo(map);
            }

            // Group contiguous Stopped and Idle points for this trip
            interface GpsEvent {
                type: "Stopped" | "Idle";
                startPoint: typeof gpsData[0];
                endPoint: typeof gpsData[0];
            }

            const events: GpsEvent[] = [];
            let currentEvent: GpsEvent | null = null;

            gpsData.forEach((point) => {
                const isStopped = !point.ignition;
                const isIdle = point.ignition && point.calculatedSpeed === 0;
                const stateType = isStopped ? "Stopped" : isIdle ? "Idle" : null;

                if (stateType) {
                    if (currentEvent && currentEvent.type === stateType) {
                        currentEvent.endPoint = point;
                    } else {
                        if (currentEvent) {
                            events.push(currentEvent);
                        }
                        currentEvent = {
                            type: stateType,
                            startPoint: point,
                            endPoint: point
                        };
                    }
                } else {
                    if (currentEvent) {
                        events.push(currentEvent);
                        currentEvent = null;
                    }
                }
            });

            if (currentEvent) {
                events.push(currentEvent);
            }

            // Draw a single circle marker for each event
            events.forEach((event) => {
                const duration = (new Date(event.endPoint.timestamp).getTime() - new Date(event.startPoint.timestamp).getTime()) / 1000;
                // Only plot if the duration is significant (e.g. >= 10 seconds)
                if (duration < 10) return;

                const latLng: L.LatLngExpression = [event.startPoint.latitude, event.startPoint.longitude];
                const minutes = Math.round(duration / 60);
                const durationStr = minutes > 0 ? `${minutes} Mins` : `${Math.round(duration)} Secs`;

                if (event.type === "Stopped") {
                    L.circleMarker(latLng, {
                        radius: 7,
                        fillColor: "#0047FF",
                        color: "#FFFFFF",
                        weight: 2,
                        fillOpacity: 1
                    })
                        .bindPopup(`<b>Stopped for ${durationStr}</b><br/>Time: ${new Date(event.startPoint.timestamp).toLocaleTimeString()}`)
                        .addTo(map);
                } else if (event.type === "Idle") {
                    L.circleMarker(latLng, {
                        radius: 7,
                        fillColor: "#EC4899",
                        color: "#FFFFFF",
                        weight: 2,
                        fillOpacity: 1
                    })
                        .bindPopup(`<b>Idle for ${durationStr}</b><br/>Time: ${new Date(event.startPoint.timestamp).toLocaleTimeString()}`)
                        .addTo(map);
                }
            });
        });

        if (allCoordinates.length > 0) {
            map.fitBounds(L.latLngBounds(allCoordinates));
        }
    }, [tripData]);

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs}Hr ${mins} Mins`;
        }
        return `${mins} Mins`;
    };

    const activeTrip = tripData.find(item => item.trip.id === activeTripId);

    const ITEMS_PER_PAGE = 10;
    const totalGPSEntries = activeTrip ? activeTrip.gpsData.length : 0;
    const totalPages = Math.ceil(totalGPSEntries / ITEMS_PER_PAGE);

    const currentGPSEntries = activeTrip
        ? activeTrip.gpsData.slice((gpsPage - 1) * ITEMS_PER_PAGE, gpsPage * ITEMS_PER_PAGE)
        : [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
                <p className="text-sm font-semibold text-slate-500">Loading map and trip details...</p>
            </div>
        );
    }

    const currentTripIndex = tripData.findIndex(t => t.trip.id === activeTripId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            
            {/* Header Navigation */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 md:px-12 shrink-0">
                <div className="flex items-center gap-2">
                    <svg 
                        className="w-8 h-8 text-[#0F172A]" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5a8.25 8.25 0 0 1 16.5 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25h-7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 17.25h-7.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M6.3 6.3l1.1 1.1M17.7 6.3l-1.1 1.1M3.75 13.5H5.25M18.75 13.5H20.25" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 12.5l3.5-4" />
                    </svg>
                    <span className="text-xl font-black text-[#0F172A] tracking-tight">Speedo</span>
                </div>
            </header>

            {/* Content Wrapper */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-6 flex flex-col">
                
                {/* Back Link Arrow */}
                <button 
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all font-semibold text-sm cursor-pointer self-start"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>

                {activeTrip && (
                    <>
                        {/* Title Bar Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
                            <span className="text-base font-bold text-slate-800">
                                {activeTrip.trip.tripName}
                            </span>
                            <button className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs active:scale-95 transition-all cursor-pointer">
                                New
                            </button>
                        </div>

                        {/* Legends */}
                        <div className="flex items-center gap-6 px-1 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#0047FF]"></span>
                                <span>Stopped</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#EC4899]"></span>
                                <span>Idle</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00FFFF]"></span>
                                <span>Over speeding</span>
                            </div>
                        </div>

                        {/* Map Container */}
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                            <div id="map" className="h-[360px] w-full z-10"></div>
                        </div>

                        {/* Horizontal Trip Tab Selector (Mockup Pagination) */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-0 mb-6 w-full">
                            <button
                                disabled={currentTripIndex === 0}
                                onClick={() => {
                                    setActiveTripId(tripData[currentTripIndex - 1].trip.id);
                                    setGpsPage(1);
                                }}
                                className="w-10 h-10 border border-slate-200 rounded-lg bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-35 transition-all cursor-pointer shrink-0 mb-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <div className="flex-1 flex items-center justify-center gap-8 overflow-x-auto no-scrollbar pb-0 mb-[-1px]">
                                {tripData.map((tripDetail) => (
                                    <button
                                        key={tripDetail.trip.id}
                                        onClick={() => {
                                            setActiveTripId(tripDetail.trip.id);
                                            setGpsPage(1);
                                        }}
                                        className={`text-sm font-semibold transition-all cursor-pointer pb-3 border-b-2 ${
                                            activeTripId === tripDetail.trip.id
                                                ? "text-blue-500 border-blue-500 font-bold"
                                                : "text-slate-400 border-transparent hover:text-slate-600"
                                        }`}
                                    >
                                        {tripDetail.trip.tripName}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentTripIndex === tripData.length - 1}
                                onClick={() => {
                                    setActiveTripId(tripData[currentTripIndex + 1].trip.id);
                                    setGpsPage(1);
                                }}
                                className="w-10 h-10 border border-slate-200 rounded-lg bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-35 transition-all cursor-pointer shrink-0 mb-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </div>

                        {/* 5 Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* Card 1: Total Distance */}
                            <div className="relative bg-white border border-slate-200 rounded-xl p-5 min-h-[130px] flex flex-col items-center justify-center shadow-xs">
                                <div className="absolute top-4 left-4 text-blue-500 shrink-0">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="6" r="3" />
                                        <path d="M6 15a9 9 0 0 1 9-9" />
                                    </svg>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-xl font-bold text-slate-800">
                                        {(activeTrip.trip.totalDistance / 1000).toFixed(1).replace(/\.0$/, '')} KM
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Total Distanced Travelled</p>
                                </div>
                            </div>

                            {/* Card 2: Total Duration */}
                            <div className="relative bg-white border border-slate-200 rounded-xl p-5 min-h-[130px] flex flex-col items-center justify-center shadow-xs">
                                <div className="absolute top-4 left-4 text-blue-500 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="9" />
                                        <polyline points="12 7 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-xl font-bold text-slate-800">
                                        {formatDuration(activeTrip.trip.totalDuration)}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Total Travelled Duration</p>
                                </div>
                            </div>

                            {/* Card 3: Overspeeding Duration */}
                            <div className="relative bg-white border border-slate-200 rounded-xl p-5 min-h-[130px] flex flex-col items-center justify-center shadow-xs">
                                <div className="absolute top-4 left-4 text-cyan-400 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="9" />
                                        <polyline points="12 7 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-xl font-bold text-slate-800">
                                        {formatDuration(activeTrip.trip.overspeedDuration)}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Over Speeding Duration</p>
                                </div>
                            </div>

                            {/* Card 4: Overspeeding Distance */}
                            <div className="relative bg-white border border-slate-200 rounded-xl p-5 min-h-[130px] flex flex-col items-center justify-center shadow-xs">
                                <div className="absolute top-4 left-4 text-cyan-400 shrink-0">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="6" r="3" />
                                        <path d="M6 15a9 9 0 0 1 9-9" />
                                    </svg>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-xl font-bold text-slate-800">
                                        {(activeTrip.trip.overspeedDistance / 1000).toFixed(1).replace(/\.0$/, '')} KM
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Over Speeding Distance</p>
                                </div>
                            </div>

                            {/* Card 5: Stopped Duration */}
                            <div className="relative bg-white border border-slate-200 rounded-xl p-5 min-h-[130px] flex flex-col items-center justify-center shadow-xs">
                                <div className="absolute top-4 left-4 text-blue-500 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="9" />
                                        <polyline points="12 7 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="text-center mt-6">
                                    <p className="text-xl font-bold text-slate-800">
                                        {formatDuration(activeTrip.trip.stoppageDuration)}
                                    </p>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Stopped Duration</p>
                                </div>
                            </div>
                        </div>

                        {/* Unified Table & Sidebar Summary Panel Layout */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                            {/* Left Column: GPS Table (col-span 2) */}
                            <div className="md:col-span-2 overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-700 text-xs font-bold border-b border-slate-200">
                                            <th className="border-r border-slate-200 px-6 py-4">Time</th>
                                            <th className="border-r border-slate-200 px-6 py-4">Point</th>
                                            <th className="border-r border-slate-200 px-6 py-4 text-center">Ignition</th>
                                            <th className="px-6 py-4 text-right">Speed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600 text-xs font-semibold">
                                        {currentGPSEntries.map((point, index) => (
                                            <tr key={index} className="hover:bg-slate-50/10 border-b border-slate-200 last:border-b-0">
                                                <td className="border-r border-slate-200 px-6 py-4.5">
                                                    {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} to {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </td>
                                                <td className="border-r border-slate-200 px-6 py-4.5 text-slate-500">
                                                    {point.latitude.toFixed(4)}° N, {point.longitude.toFixed(4)}° W
                                                </td>
                                                <td className="border-r border-slate-200 px-6 py-4.5 text-center">
                                                    <span className={`inline-block text-xs font-extrabold ${
                                                        point.ignition ? "text-green-600" : "text-red-500"
                                                    }`}>
                                                        {point.ignition ? "ON" : "OFF"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4.5 text-right text-slate-800">
                                                    {point.calculatedSpeed > 0 ? `${point.calculatedSpeed.toFixed(1)} KM/H` : ""}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Right Column: Trip Summary Info (col-span 1) */}
                            <div className="flex flex-col bg-white">
                                {/* Top matching empty header bar */}
                                <div className="bg-slate-50/50 border-b border-slate-200 h-[53px] shrink-0"></div>
                                
                                {/* Content area */}
                                <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                                    <div className="space-y-6 text-sm font-semibold text-slate-500">
                                        <div className="flex items-center justify-between">
                                            <span>Travel Duration</span>
                                            <span className="text-slate-800 font-bold">{formatDuration(activeTrip.trip.totalDuration)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Stopped from</span>
                                            <span className="text-slate-800 font-bold">{formatDuration(activeTrip.trip.stoppageDuration)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Distance</span>
                                            <span className="text-slate-800 font-bold">{(activeTrip.trip.totalDistance / 1000).toFixed(1).replace(/\.0$/, '')} KM</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Overspeeding Duration</span>
                                            <span className="text-slate-800 font-bold">{formatDuration(activeTrip.trip.overspeedDuration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Centered Table Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <button
                                    onClick={() => setGpsPage(prev => Math.max(prev - 1, 1))}
                                    disabled={gpsPage === 1}
                                    className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-xs font-semibold cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (gpsPage > 3 && totalPages > 5) {
                                        pageNum = Math.min(gpsPage - 3 + i, totalPages - 4 + i);
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setGpsPage(pageNum)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                                gpsPage === pageNum
                                                    ? "border-blue-500 text-blue-500 font-bold bg-white"
                                                    : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setGpsPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={gpsPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-xs font-semibold cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}


            </main>
        </div>
    );
}
