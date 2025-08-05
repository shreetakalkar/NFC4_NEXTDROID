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

// 1. Define types for your data
interface PanicEvent {
  id: string;
  location: GeoPoint;
  timestamp: Date;
}

interface CaseEvent {
  id: string;
  attachmentAudio: string[];
  attachmentImage: string[];
  attachmentVideo: string[];
  createdAt: Date;
  currentLocation: GeoPoint;
  description: string;
  incidentDate: Date;
  incidentLocation: GeoPoint;
  isAnonymous: boolean;
  name: string;
  priority: string;
  status: string;
  uid: string;
}

// 2. Create FirestoreDataConverters for type safety
const panicEventConverter = {
  toFirestore(event: PanicEvent): DocumentData {
    return { location: event.location, timestamp: event.timestamp };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): PanicEvent {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      location: data.location as GeoPoint,
      timestamp: data.timestamp?.toDate() || new Date(),
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

// In your React Component
export default function PanicMap() {
  const [panicEvents, setPanicEvents] = useState<PanicEvent[]>([]);
  const [caseEvents, setCaseEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch panic events
        const panicEventsCollection = collection(db, "panic_events").withConverter(
          panicEventConverter
        );
        const panicQuerySnapshot = await getDocs(panicEventsCollection);
        const fetchedPanicEvents = panicQuerySnapshot.docs.map((doc) => doc.data());

        // Fetch case events
        const caseEventsCollection = collection(db, "cases").withConverter(
          caseEventConverter
        );
        const caseQuerySnapshot = await getDocs(caseEventsCollection);
        const fetchedCaseEvents = caseQuerySnapshot.docs.map((doc) => doc.data());

        if (isMounted) {
          setPanicEvents(fetchedPanicEvents);
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
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Panic Events ({panicEvents.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Case Reports ({caseEvents.length})</span>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={9}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%" }}
        className="rounded-lg"
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Panic Events - Blue markers */}
        {panicEvents.map((event, i) => (
          <Marker
            key={`panic-${i}`}
            position={[event.location.latitude, event.location.longitude]}
          >
            <Popup>
              <div>
                <h3 className="font-bold text-blue-600">Panic Event</h3>
                <p><strong>Location:</strong> {event.location.latitude.toFixed(6)}, {event.location.longitude.toFixed(6)}</p>
                <p><strong>Time:</strong> {event.timestamp.toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Case Events - Red markers */}
        {caseEvents.map((caseEvent, i) => (
          <Marker
            key={`case-${i}`}
            position={[caseEvent.incidentLocation.latitude, caseEvent.incidentLocation.longitude]}
            icon={redIcon}
          >
            <Popup>
              <div className="max-w-xs">
                <h3 className="font-bold text-red-600">Case Report</h3>
                <p><strong>Status:</strong> {caseEvent.status}</p>
                <p><strong>Priority:</strong> {caseEvent.priority}</p>
                <p><strong>Description:</strong> {caseEvent.description}</p>
                <p><strong>Reporter:</strong> {caseEvent.isAnonymous ? "Anonymous" : caseEvent.name}</p>
                <p><strong>Incident Location:</strong> {caseEvent.incidentLocation.latitude.toFixed(6)}, {caseEvent.incidentLocation.longitude.toFixed(6)}</p>
                <p><strong>Incident Date:</strong> {caseEvent.incidentDate.toLocaleDateString()}</p>
                <p><strong>Reported:</strong> {caseEvent.createdAt.toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}