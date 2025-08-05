"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Your Firebase config
import {
  collection,
  getDocs,
  GeoPoint,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Marker img fetch
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// const DefaultIcon = L.icon({
//   iconUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Red_dot.svg", // simple red dot
//   iconRetinaUrl:
//     "https://upload.wikimedia.org/wikipedia/commons/9/9f/Yellow_dot.svg",
//   iconSize: [12, 12],
//   iconAnchor: [7, 25],
//   popupAnchor: [1, -24],
//   tooltipAnchor: [10, -20],
//   shadowSize: [25, 25],
// });
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// L.Marker.prototype.options.icon = DefaultIcon;

// 1. Define a type for your data
interface PanicEvent {
  id: string;
  location: GeoPoint;
  timestamp: Date; // Assuming you have a timestamp
  // ... other fields
}

// 2. (Optional but recommended) Create a FirestoreDataConverter for type safety
const panicEventConverter = {
  toFirestore(event: PanicEvent): DocumentData {
    return { location: event.location, timestamp: event.timestamp };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): PanicEvent {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      location: data.location as GeoPoint,
      timestamp: data.timestamp.toDate(), // Convert Firestore Timestamp to JS Date
    };
  },
};

// In your React Component
export default function PanicMap() {
  const [events, setEvents] = useState<PanicEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Use the converter for type-safe queries
        const eventsCollection = collection(db, "panic_events").withConverter(
          panicEventConverter
        );
        const querySnapshot = await getDocs(eventsCollection);

        const fetchedEvents = querySnapshot.docs.map((doc) => doc.data());

        if (isMounted) {
          setEvents(fetchedEvents);
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
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "600px", width: "90%" }}
        className="rounded-lg"
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((event, i) => (
          <Marker
            key={i}
            position={[event.location.latitude, event.location.longitude]}
          >
            <Popup>
               {event.location.latitude}, {event.location.longitude}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
