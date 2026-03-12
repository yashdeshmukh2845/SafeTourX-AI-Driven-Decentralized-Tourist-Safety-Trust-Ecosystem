import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getRiskPrediction, getRouteRisk } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Fix Leaflet Default Icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper: Decode Polyline (OSRM returns encoded string)
// Simple decoder or use library. OSRM 'geometries=geojson' returns coordinates array directly. Much easier.

const LocationMarker = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15);
        }
    }, [position, map]);
    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
};

// Click Handler
const ClickHandler = ({ setPoint, mode }) => {
    useMapEvents({
        click(e) {
            if (mode) {
                setPoint([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return null;
};

const MapView = () => {
    const navigate = useNavigate();
    const [currentPosition, setCurrentPosition] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [tracking, setTracking] = useState(false);

    // Routing State
    const [routingMode, setRoutingMode] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [selectingStart, setSelectingStart] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [bestRouteIndex, setBestRouteIndex] = useState(-1);
    const [loadingRoutes, setLoadingRoutes] = useState(false);

    // Initial Position
    useEffect(() => {
        console.log("MapView mounted. Checking geoloc...");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Geoloc success:", position.coords);
                    const pos = [position.coords.latitude, position.coords.longitude];
                    setCurrentPosition(pos);
                    // Default start point to current loc
                    if (!startPoint) setStartPoint(pos);
                    checkRisk(pos[0], pos[1]);
                },
                (error) => {
                    console.error("Geoloc error:", error);
                    setCurrentPosition([19.0760, 72.8777]);
                }
            );
        } else {
            console.log("Geoloc not supported");
            setCurrentPosition([19.0760, 72.8777]);
        }
    }, []);

    const checkRisk = async (lat, lon) => {
        try {
            const risk = await getRiskPrediction({ lat, lon });
            setRiskData(risk);
        } catch (error) {
            console.error('Risk check failed:', error);
        }
    };

    const handleFindSafestPath = async () => {
        if (!startPoint || !endPoint) {
            toast.error("Please select both Start and Destination points on the map.");
            return;
        }

        setLoadingRoutes(true);
        setRoutes([]);
        setBestRouteIndex(-1);

        try {
            // Fetch Routes from OSRM
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}?overview=full&geometries=geojson&alternatives=true`;
            const response = await axios.get(osrmUrl);

            if (!response.data.routes || response.data.routes.length === 0) {
                toast.error("No routes found.");
                setLoadingRoutes(false);
                return;
            }

            const rawRoutes = response.data.routes;
            const analyzedRoutes = [];

            // Analyze Risk for each route
            for (let i = 0; i < rawRoutes.length; i++) {
                const route = rawRoutes[i];
                const coords = route.geometry.coordinates; // [lon, lat]

                // Sample points (every 20th point to avoid overload)
                const samplePoints = coords.filter((_, idx) => idx % 20 === 0).map(c => ({
                    lat: c[1],
                    lon: c[0],
                    hour: new Date().getHours()
                }));

                // Get Risk from AI
                const riskResp = await getRouteRisk(samplePoints);
                const avgRisk = riskResp.avg_risk_score || 0; // 0=Low, 1=Med, 2=High, 3=V.High

                analyzedRoutes.push({
                    ...route,
                    avgRiskScore: avgRisk,
                    latLngs: coords.map(c => [c[1], c[0]]) // Leaflet needs [lat, lon]
                });
            }

            // Find Safest (Lowest avg risk)
            const sortedRoutes = analyzedRoutes.map((r, idx) => ({ ...r, originalIndex: idx }))
                .sort((a, b) => a.avgRiskScore - b.avgRiskScore);

            const bestIndex = sortedRoutes[0].originalIndex;

            setRoutes(analyzedRoutes);
            setBestRouteIndex(bestIndex);
            toast.success(`Found ${analyzedRoutes.length} routes. Safest path highlighted!`);

        } catch (error) {
            console.error("Routing Error:", error);
            toast.error("Failed to calculate safest path.");
        } finally {
            setLoadingRoutes(false);
        }
    };

    const getRiskColor = (score) => {
        // Score is 0-100
        if (score < 30) return '#10b981'; // Green (Low)
        if (score < 60) return '#eab308'; // Yellow (Medium)
        if (score < 80) return '#f97316'; // Orange (High)
        return '#ef4444'; // Red (Very High)
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        {routingMode ? "Safest Path Finder 🛡️" : "Live SafeMap 🗺️"}
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setRoutingMode(!routingMode)}
                            className="bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 text-blue-700 dark:text-blue-200 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            {routingMode ? "Exit Navigation" : "Find Safest Path"}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-medium border dark:border-gray-600"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 py-4 w-full flex flex-col gap-4">

                {/* Routing Controls */}
                {routingMode && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-3 rounded-lg border-2 cursor-pointer ${selectingStart ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}
                            onClick={() => setSelectingStart(true)}>
                            <p className="text-xs text-gray-500 uppercase font-bold">Start Point</p>
                            <p className="font-mono truncate">{startPoint ? `${startPoint[0].toFixed(4)}, ${startPoint[1].toFixed(4)}` : "Click on Map"}</p>
                        </div>
                        <div className={`p-3 rounded-lg border-2 cursor-pointer ${!selectingStart ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-600'}`}
                            onClick={() => setSelectingStart(false)}>
                            <p className="text-xs text-gray-500 uppercase font-bold">Destination</p>
                            <p className="font-mono truncate">{endPoint ? `${endPoint[0].toFixed(4)}, ${endPoint[1].toFixed(4)}` : "Click on Map"}</p>
                        </div>
                        <button
                            onClick={handleFindSafestPath}
                            disabled={loadingRoutes}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
                        >
                            {loadingRoutes ? <div className="spinner h-5 w-5"></div> : "Analyze Routes 🚀"}
                        </button>
                    </div>
                )}

                {/* Map */}
                <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 relative z-0 min-h-[500px]">
                    <MapContainer
                        center={currentPosition || [19.0760, 72.8777]}
                        zoom={13}
                        style={{ height: '70vh', width: '100%', minHeight: '500px' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Map Mode Click Handler */}
                        {routingMode && <ClickHandler setPoint={selectingStart ? setStartPoint : setEndPoint} mode={routingMode} />}

                        {/* Current Loc Marker */}
                        {!routingMode && <LocationMarker position={currentPosition} />}

                        {/* Routing Markers */}
                        {routingMode && startPoint && <Marker position={startPoint} icon={new L.Icon({ iconUrl: icon, iconSize: [25, 41], className: 'hue-rotate-90' })}><Popup>Start</Popup></Marker>}
                        {routingMode && endPoint && <Marker position={endPoint}><Popup>Destination</Popup></Marker>}

                        {/* Route Polylines */}
                        {routingMode && routes.map((route, idx) => {
                            const isBest = idx === bestRouteIndex;
                            const riskColor = getRiskColor(route.avgRiskScore);

                            return (
                                <Polyline
                                    key={idx}
                                    positions={route.latLngs}
                                    pathOptions={{
                                        color: riskColor,
                                        weight: isBest ? 8 : 5,
                                        opacity: isBest ? 0.9 : 0.6,
                                        dashArray: isBest ? null : '5, 10'
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <b className="text-lg">Route {idx + 1}</b>
                                            {isBest && <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Safest</span>}
                                            <div className="mt-2 text-left text-sm">
                                                <p>Risk Score: <b style={{ color: riskColor }}>{route.avgRiskScore.toFixed(1)}%</b></p>
                                                <p>Distance: {(route.distance / 1000).toFixed(1)} km</p>
                                                <p>Duration: {(route.duration / 60).toFixed(0)} min</p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Polyline>
                            );
                        })}

                        {/* Risk Zone (Only tracking mode) */}
                        {!routingMode && riskData && currentPosition && (
                            <Circle
                                center={currentPosition}
                                pathOptions={{
                                    color: getRiskColor(riskData.risk_level),
                                    fillColor: getRiskColor(riskData.risk_level),
                                    fillOpacity: 0.2
                                }}
                                radius={500}
                            />
                        )}
                    </MapContainer>
                </div>
            </main>
        </div>
    );
};

export default MapView;
