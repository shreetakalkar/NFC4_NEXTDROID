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

// Marker img fetch and configuration
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set up the default blue icon
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Create a custom red icon for 'case' events
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


// 1. Define a unified type for any marker on the map
interface MapMarker {
  id: string;
  source: 'panic' | 'case'; // Differentiate the origin
  location: GeoPoint;
  title: string;
  details: string;
}

// 2. Update the 'panic_events' converter to the unified type
const panicEventConverter = {
  toFirestore(event: MapMarker): DocumentData {
    return { location: event.location, timestamp: new Date() }; // Example
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): MapMarker {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      source: 'panic',
      location: data.location as GeoPoint,
      title: 'Panic Alert',
      details: `Triggered on: ${data.timestamp.toDate().toLocaleString()}`,
    };
  },
};

// 3. Create a new converter for the 'cases' collection
const caseConverter = {
    toFirestore(event: MapMarker): DocumentData {
        return { incidentLocation: event.location, name: event.title }; // Example
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): MapMarker {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            source: 'case',
            location: data.incidentLocation as GeoPoint, // Using the new field name
            title: data.name || 'Case Report',
            details: `Incident Date: ${data.incidentDate.toDate().toLocaleDateString()}`
        }
    }
}


export default function PanicMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([]); // Renamed state for clarity
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Prepare queries for both collections using their converters
        const panicCollection = collection(db, "panic_events").withConverter(panicEventConverter);
        const casesCollection = collection(db, "cases", "incidentLocation").withConverter(caseConverter);

        // Fetch both sets of data concurrently
        const [panicSnapshot, casesSnapshot] = await Promise.all([
            getDocs(panicCollection),
            getDocs(casesCollection)
        ]);

        const panicMarkers = panicSnapshot.docs.map((doc) => doc.data());
        const caseMarkers = casesSnapshot.docs.map((doc) => doc.data());

        // Combine markers from both sources into one array
        const allMarkers = [...panicMarkers, ...caseMarkers];

        if (isMounted) {
          setMarkers(allMarkers);
        }
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        if (isMounted) {
          setError("Could not load map data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return <div>Loading Map...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <MapContainer
        center={[19.076, 72.8777]} // Centered on Mumbai
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%" }}
        className="rounded-lg border"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.location.latitude, marker.location.longitude]}
            // Conditionally choose the icon based on the data source
            icon={marker.source === 'case' ? redIcon : new L.Icon.Default()}
          >
            <Popup>
              <div style={{lineHeight: '1.4'}}>
                <strong style={{fontSize: '14px'}}>{marker.title}</strong>
                <br />
                {marker.details}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}