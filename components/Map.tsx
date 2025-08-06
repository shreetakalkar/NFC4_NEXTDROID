"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Your Firebase config
import {
  collection,
  getDocs,
  GeoPoint,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Marker img fetch
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Default blue marker
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Red marker for cases
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowUrl: markerShadow.src,
  shadowSize: [41, 41],
});

// Orange marker for panic alerts
const orangeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowUrl: markerShadow.src,
  shadowSize: [41, 41],
});

// 1. Define types for your data
interface PanicAlert {
  id: string;
  location: GeoPoint;
  timestamp: Date;
  userId: string;
  audioUrl?: string;
}

interface CaseEvent {
  id: string;
  attachmentAudio: string[];
  attachmentImage: string[];
  attachmentVideo: string[];
  createdAt: Date;
  currentLocation?: GeoPoint;
  description: string;
  incidentDate: Date;
  incidentLocation?: GeoPoint;
  isAnonymous: boolean;
  name: string;
  priority: string;
  status: string;
  uid: string;
}

// 2. Create FirestoreDataConverters for type safety
const panicAlertConverter = {
  toFirestore(alert: PanicAlert): DocumentData {
    return { 
      location: alert.location, 
      timestamp: alert.timestamp,
      userId: alert.userId,
      audioUrl: alert.audioUrl 
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): PanicAlert {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      location: data.location as GeoPoint,
      timestamp: data.timestamp?.toDate() || new Date(),
      userId: data.userId || "",
      audioUrl: data.audioUrl || "",
    };
  },
};

const caseEventConverter = {
  toFirestore(caseEvent: CaseEvent): DocumentData {
    return {
      attachmentAudio: caseEvent.attachmentAudio,
      attachmentImage: caseEvent.attachmentImage,
      attachmentVideo: caseEvent.attachmentVideo,
      createdAt: caseEvent.createdAt,
      currentLocation: caseEvent.currentLocation,
      description: caseEvent.description,
      incidentDate: caseEvent.incidentDate,
      incidentLocation: caseEvent.incidentLocation,
      isAnonymous: caseEvent.isAnonymous,
      name: caseEvent.name,
      priority: caseEvent.priority,
      status: caseEvent.status,
      uid: caseEvent.uid,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): CaseEvent {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      attachmentAudio: data.attachmentAudio || [],
      attachmentImage: data.attachmentImage || [],
      attachmentVideo: data.attachmentVideo || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      currentLocation: data.currentLocation as GeoPoint,
      description: data.description || "",
      incidentDate: data.incidentDate?.toDate() || new Date(),
      incidentLocation: data.incidentLocation as GeoPoint,
      isAnonymous: data.isAnonymous || false,
      name: data.name || "",
      priority: data.priority || "",
      status: data.status || "",
      uid: data.uid || "",
    };
  },
};

// Helper function to check valid coordinates
const isValidGeoPoint = (geoPoint: GeoPoint | undefined | null): boolean => {
  return (
    geoPoint !== undefined &&
    geoPoint !== null &&
    typeof geoPoint.latitude === 'number' &&
    typeof geoPoint.longitude === 'number' &&
    !isNaN(geoPoint.latitude) &&
    !isNaN(geoPoint.longitude) &&
    geoPoint.latitude >= -90 &&
    geoPoint.latitude <= 90 &&
    geoPoint.longitude >= -180 &&
    geoPoint.longitude <= 180
  );
};

// In your React Component
export default function PanicMap() {
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([]);
  const [caseEvents, setCaseEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch panic alerts
        const panicAlertsCollection = collection(db, "panic_events").withConverter(
          panicAlertConverter
        );
        const panicQuerySnapshot = await getDocs(panicAlertsCollection);
        const fetchedPanicAlerts = panicQuerySnapshot.docs
          .map((doc) => doc.data())
          .filter((alert) => isValidGeoPoint(alert.location)); // Filter out invalid locations

        // Fetch case events
        const caseEventsCollection = collection(db, "cases").withConverter(
          caseEventConverter
        );
        const caseQuerySnapshot = await getDocs(caseEventsCollection);
        const fetchedCaseEvents = caseQuerySnapshot.docs
          .map((doc) => doc.data())
          .filter((caseEvent) => 
            isValidGeoPoint(caseEvent.incidentLocation) || 
            isValidGeoPoint(caseEvent.currentLocation)
          ); // Filter out events without valid locations

        if (isMounted) {
          setPanicAlerts(fetchedPanicAlerts);
          setCaseEvents(fetchedCaseEvents);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        if (isMounted) {
          setError("Could not load event data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to run when the component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Panic Alerts ({panicAlerts.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Case Reports ({caseEvents.length})</span>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%" }}
        className="rounded-lg border"
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Panic Alerts - Orange markers */}
        {panicAlerts.map((alert, i) => (
          <Marker
            key={`panic-${alert.id}-${i}`}
            position={[alert.location.latitude, alert.location.longitude]}
            icon={orangeIcon}
          >
            <Popup>
              <div className="max-w-xs">
                <h3 className="font-bold text-orange-600 mb-2">🚨 Panic Alert</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Alert ID:</strong> {alert.id}</p>
                  <p><strong>User ID:</strong> {alert.userId}</p>
                  <p><strong>Location:</strong> {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}</p>
                  <p><strong>Triggered:</strong> {alert.timestamp.toLocaleString()}</p>
                  {alert.audioUrl && (
                    <div className="mt-2">
                      <audio controls className="w-full">
                        <source src={alert.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Case Events - Red markers */}
        {caseEvents.map((caseEvent, i) => {
          // Use incidentLocation if available, otherwise fall back to currentLocation
          const location = isValidGeoPoint(caseEvent.incidentLocation) 
            ? caseEvent.incidentLocation 
            : caseEvent.currentLocation;
          
          if (!isValidGeoPoint(location)) {
            return null; // Skip this marker if no valid location
          }

          return (
            <Marker
              key={`case-${caseEvent.id}-${i}`}
              position={[location!.latitude, location!.longitude]}
              icon={redIcon}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-bold text-red-600 mb-2">📋 Case Report</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Case:</strong> {caseEvent.name || "Untitled"}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        caseEvent.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        caseEvent.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {caseEvent.status}
                      </span>
                    </p>
                    <p><strong>Priority:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        caseEvent.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        caseEvent.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        caseEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {caseEvent.priority}
                      </span>
                    </p>
                    <p><strong>Description:</strong> {caseEvent.description.length > 100 
                      ? caseEvent.description.substring(0, 100) + "..." 
                      : caseEvent.description}</p>
                    <p><strong>Reporter:</strong> {caseEvent.isAnonymous ? "Anonymous" : caseEvent.name}</p>
                    <p><strong>Location:</strong> {location!.latitude.toFixed(6)}, {location!.longitude.toFixed(6)}</p>
                    <p><strong>Incident Date:</strong> {caseEvent.incidentDate.toLocaleDateString()}</p>
                    <p><strong>Reported:</strong> {caseEvent.createdAt.toLocaleString()}</p>
                    {(caseEvent.attachmentImage.length > 0 || caseEvent.attachmentVideo.length > 0 || caseEvent.attachmentAudio.length > 0) && (
                      <p><strong>Attachments:</strong> 
                        {caseEvent.attachmentImage.length} 📷 
                        {caseEvent.attachmentVideo.length} 🎥 
                        {caseEvent.attachmentAudio.length} 🔊
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}