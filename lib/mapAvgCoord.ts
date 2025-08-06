import { doc, setDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

// Calculate distance between two points in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Find the center of highest concentration using density-based approach
const findConcentrationCenter = (coordinates: Array<{lat: number, lng: number}>, radius = 1000): {lat: number, lng: number} | null => {
  if (coordinates.length === 0) return null;
  
  let maxDensity = 0;
  let concentrationCenter = coordinates[0];
  
  // Check each point as potential center
  for (const candidate of coordinates) {
    let nearbyCount = 0;
    
    // Count points within radius of this candidate
    for (const point of coordinates) {
      const distance = calculateDistance(
        candidate.lat, candidate.lng,
        point.lat, point.lng
      );
      
      if (distance <= radius) {
        nearbyCount++;
      }
    }
    
    // Update if this location has higher density
    if (nearbyCount > maxDensity) {
      maxDensity = nearbyCount;
      concentrationCenter = candidate;
    }
  }
  
  // If we found a good center, calculate weighted centroid of nearby points
  if (maxDensity > 1) {
    const nearbyPoints = coordinates.filter(point => {
      const distance = calculateDistance(
        concentrationCenter.lat, concentrationCenter.lng,
        point.lat, point.lng
      );
      return distance <= radius;
    });
    
    const centroidLat = nearbyPoints.reduce((sum, p) => sum + p.lat, 0) / nearbyPoints.length;
    const centroidLng = nearbyPoints.reduce((sum, p) => sum + p.lng, 0) / nearbyPoints.length;
    
    return { lat: centroidLat, lng: centroidLng };
  }
  
  return concentrationCenter;
};

export const storeAverageCoordinates = async (
  panicAlerts: PanicAlert[],
  caseEvents: CaseEvent[]
) => {
  console.log("Finding concentration centers...", {
    panicCount: panicAlerts.length,
    caseCount: caseEvents.length
  });

  try {
    // Get panic coordinates
    const panicCoords = panicAlerts
      .filter(alert => isValidGeoPoint(alert.location))
      .map(alert => ({
        lat: alert.location.latitude,
        lng: alert.location.longitude
      }));
    
    // Get case coordinates
    const caseCoords = caseEvents
      .filter(caseEvent => 
        isValidGeoPoint(caseEvent.incidentLocation) || 
        isValidGeoPoint(caseEvent.currentLocation)
      )
      .map(caseEvent => {
        const location = isValidGeoPoint(caseEvent.incidentLocation) 
          ? caseEvent.incidentLocation 
          : caseEvent.currentLocation;
        return {
          lat: location!.latitude,
          lng: location!.longitude
        };
      });

    // Find concentration centers
    const panicAvg = findConcentrationCenter(panicCoords, 500); // 500m radius for panic
    const casesAvg = findConcentrationCenter(caseCoords, 800); // 800m radius for cases

    // Store in database
    const avgCoordsRef = doc(db, "danger_zones", "average_coordinates");
    await setDoc(avgCoordsRef, {
      panicAvg,
      casesAvg,
      lastUpdated: serverTimestamp(),
      timestamp: new Date().toISOString()
    }, { merge: true });

    console.log("Concentration centers stored successfully:", {
      panicAvg,
      casesAvg
    });

  } catch (error) {
    console.error("Error storing concentration centers:", error);
    throw error;
  }
};