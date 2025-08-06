"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // Your Firebase config
import { getFirestore } from "firebase/firestore";
import {
  collection,
  getDocs,
  GeoPoint,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import { useEffect as useLeafletEffect } from "react";
import L from "leaflet";

// Import heatmap functionality
import "leaflet.heat";

// Heatmap component using leaflet.heat
function HeatmapLayer({ points, options = {} }) {
  const map = useMap();

  useLeafletEffect(() => {
    if (!points || points.length === 0) return;

    // Create heat layer using leaflet.heat
    const heat = L.heatLayer(points, {
      radius: options.radius || 25,
      blur: options.blur || 15,
      maxZoom: options.maxZoom || 17,
      max: options.max || 1.0,
      gradient: options.gradient || {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        1.0: "red",
      },
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, options]);

  return null;
}

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
      audioUrl: alert.audioUrl,
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
    typeof geoPoint.latitude === "number" &&
    typeof geoPoint.longitude === "number" &&
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
        // Check if db is properly initialized
        if (!db) {
          throw new Error("Firebase database is not initialized");
        }

        // Fetch panic alerts
        const panicAlertsCollection = collection(
          db,
          "panic_events"
        ).withConverter(panicAlertConverter);
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
          .filter(
            (caseEvent) =>
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
          setError(`Could not load event data: ${err.message || err}`);
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

  // Convert data to separate heatmap points for different types
  const panicHeatmapPoints = panicAlerts.map((alert) => [
    alert.location.latitude,
    alert.location.longitude,
    2.0, // much higher intensity for panic alerts
  ]);

  const caseHeatmapPoints = caseEvents
    .map((caseEvent) => {
      const location = isValidGeoPoint(caseEvent.incidentLocation)
        ? caseEvent.incidentLocation
        : caseEvent.currentLocation;

      return [
        location!.latitude,
        location!.longitude,
        1.5, // higher intensity for regular cases
      ];
    })
    .filter((point) => point[0] !== undefined && point[1] !== undefined);

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
            <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            <span>Panic Alerts ({panicAlerts.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            <span>Case Reports ({caseEvents.length})</span>
          </div>
          <div className="text-sm text-gray-600 ml-4">
            Higher intensity areas indicate more incidents
          </div>
        </div>
      </div>

      <MapContainer
        center={[19.076, 72.8777]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "600px", width: "100%" }}
        className="rounded-lg border"
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Panic Alerts Heatmap - Red gradient */}
        {panicHeatmapPoints.length > 0 && (
          <HeatmapLayer
            points={panicHeatmapPoints}
            options={{
              radius: 60,
              blur: 40,
              maxZoom: 17,
              max: 0.5, // Lower max to make points more visible
              minOpacity: 0.3,
              gradient: {
                0.1: "#FF6B6B", // Light Red
                0.3: "#FF4444", // Medium Red
                0.5: "#FF0000", // Pure Red
                0.7: "#CC0000", // Dark Red
                1.0: "#990000", // Very Dark Red
              },
            }}
          />
        )}

        {/* Case Events Heatmap - Orange gradient */}
        {caseHeatmapPoints.length > 0 && (
          <HeatmapLayer
            points={caseHeatmapPoints}
            options={{
              radius: 50,
              blur: 30,
              maxZoom: 17,
              max: 0.5, // Lower max to make points more visible
              minOpacity: 0.2,
              gradient: {
                0.0: "#FF7F00", // Orange Red
                0.2: "#FF6600", // Red Orange
                0.4: "#FF4500", // Orange Red
                0.6: "#FF0000", // Red
                0.8: "#DC143C", // Crimson
                1.0: "#8B0000", // Dark Red
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
