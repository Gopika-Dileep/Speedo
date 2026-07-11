import { useEffect, useState, useRef } from "react";

import { useSearchParams } from "react-router-dom";

import L from "leaflet"

import "leaflet/dist/leaflet.css"

import { tripDetails } from "../api/userapi";
import type { ITripDetailResponse } from "../schema/trip.schema";


export default function Tripdetails() {
    const [searchParams] = useSearchParams()

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


        const baseColors = ["#0047FF", "#22C55E", "#A855F7", "#EAB308"];
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


                if (!curr.ignition) {
                    L.circleMarker(currLatLng, {
                        radius: 7,
                        fillColor: "#0047FF",
                        color: "#FFFFFF",
                        weight: 2,
                        fillOpacity: 1
                    })
                        .bindPopup(`<b>Stopped</b><br/>Time: ${new Date(curr.timestamp).toLocaleTimeString()}`)
                        .addTo(map);
                }

                else if (curr.ignition && curr.calculatedSpeed === 0) {
                    L.circleMarker(currLatLng, {
                        radius: 7,
                        fillColor: "#EC4899",
                        color: "#FFFFFF",
                        weight: 2,
                        fillOpacity: 1
                    })
                        .bindPopup(`<b>Idle</b><br/>Time: ${new Date(curr.timestamp).toLocaleTimeString()}`)
                        .addTo(map);
                }
            }
        });


        if (allCoordinates.length > 0) {
            map.fitBounds(L.latLngBounds(allCoordinates));
        }
    }, [tripData]);


    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs} Hr ${mins} Mins`;
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
        return <p>Loading map and trip details...</p>;
    }

    return (
        <div>
            <h1>Trip Details & Map</h1>

            {/* A. The Map Container */}
            <div id="map" style={{ height: "400px", width: "100%", border: "1px solid #ccc" }}></div>

            {/* A. Map Legends */}
            <div>
                <span>● Stopped (Blue Marker)</span> |
                <span>● Idle (Pink Marker)</span> |
                <span>━ Over Speeding (Cyan Line)</span>
            </div>

            {/* B. Tab Switcher (Horizontal pagination list of selected trips) */}
            <div>
                <button
                    disabled={tripData.findIndex(t => t.trip.id === activeTripId) === 0}
                    onClick={() => {
                        const currentIndex = tripData.findIndex(t => t.trip.id === activeTripId);
                        setActiveTripId(tripData[currentIndex - 1].trip.id);
                        setGpsPage(1);
                    }}
                >
                    &lt;
                </button>

                {tripData.map((tripDetail) => (
                    <button
                        key={tripDetail.trip.id}
                        style={{
                            fontWeight: activeTripId === tripDetail.trip.id ? "bold" : "normal",
                            textDecoration: activeTripId === tripDetail.trip.id ? "underline" : "none"
                        }}
                        onClick={() => {
                            setActiveTripId(tripDetail.trip.id);
                            setGpsPage(1); // Reset page number when switching tabs
                        }}
                    >
                        {tripDetail.trip.tripName}
                    </button>
                ))}

                <button
                    disabled={tripData.findIndex(t => t.trip.id === activeTripId) === tripData.length - 1}
                    onClick={() => {
                        const currentIndex = tripData.findIndex(t => t.trip.id === activeTripId);
                        setActiveTripId(tripData[currentIndex + 1].trip.id);
                        setGpsPage(1);
                    }}
                >
                    &gt;
                </button>
            </div>

            {/* C. Trip Summary Cards */}
            {activeTrip && (
                <div>
                    {/* Card 1: Total Distance */}
                    <div>
                        <h3>Total Distance</h3>
                        <p>{(activeTrip.trip.totalDistance / 1000).toFixed(2)} KM</p>
                    </div>

                    {/* Card 2: Total Duration */}
                    <div>
                        <h3>Total Duration</h3>
                        <p>{formatDuration(activeTrip.trip.totalDuration)}</p>
                    </div>

                    {/* Card 3: Overspeeding Duration */}
                    <div>
                        <h3>Over Speeding Duration</h3>
                        <p>{formatDuration(activeTrip.trip.overspeedDuration)}</p>
                    </div>

                    {/* Card 4: Overspeeding Distance */}
                    <div>
                        <h3>Over Speeding Distance</h3>
                        <p>{((activeTrip.trip.overspeedDistance || 0) / 1000).toFixed(2)} KM</p>
                    </div>

                    {/* Card 5: Stopped Duration */}
                    <div>
                        <h3>Stopped Duration</h3>
                        <p>{formatDuration(activeTrip.trip.stoppageDuration)}</p>
                    </div>
                </div>
            )}

            {/* D. GPS Coordinates Table & Pagination */}
            {activeTrip && (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Point (Lat, Lng)</th>
                                <th>Ignition</th>
                                <th>Speed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentGPSEntries.map((point, index) => (
                                <tr key={index}>
                                    <td>{new Date(point.timestamp).toLocaleTimeString()}</td>
                                    <td>{point.latitude.toFixed(4)}° N, {point.longitude.toFixed(4)}° W</td>
                                    <td style={{ color: point.ignition ? "green" : "red" }}>
                                        {point.ignition ? "ON" : "OFF"}
                                    </td>
                                    <td>{point.calculatedSpeed.toFixed(1)} KM/H</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Table Pagination Controls */}
                    <div>
                        <button
                            disabled={gpsPage === 1}
                            onClick={() => setGpsPage(prev => prev - 1)}
                        >
                            Prev
                        </button>

                        <span> Page {gpsPage} of {totalPages} </span>

                        <button
                            disabled={gpsPage === totalPages || totalPages === 0}
                            onClick={() => setGpsPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}






