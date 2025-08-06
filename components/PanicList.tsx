"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  GeoPoint,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Zap,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  Volume2,
  Phone,
  Clock,
} from "lucide-react";

type AlertStatus = "active" | "responding" | "resolved";

interface PanicAlert {
  id: string;
  audioUrl: string;
  location: string;
  timestamp: Date;
  userId: string;
  status: AlertStatus;
  userName?: string;
  userPhone?: string;
}

interface PanicAlertsListProps {
  searchQuery?: string;
  statusFilter?: "all" | AlertStatus;
}

export default function PanicList({
  searchQuery = "",
  statusFilter = "all",
}: PanicAlertsListProps) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPanicAlerts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const alertsCollectionRef = collection(db, "panic_events");
        const q = query(alertsCollectionRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const alertsFromDb = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            let userInfo = {};

            if (data.userId) {
              try {
                const userDocRef = doc(db, "users", data.userId);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  userInfo = {
                    userName: `${userData.firstName || ""} ${
                      userData.lastName || ""
                    }`.trim() || "Unknown User",
                    userPhone: userData.phoneNumber || "Not provided",
                  };
                }
              } catch (userError) {
                console.error("Error fetching user data:", userError);
                userInfo = {
                  userName: "Unknown User",
                  userPhone: "Not provided",
                };
              }
            }

            const formatGeoPoint = (geoPoint: GeoPoint | undefined) => {
              if (geoPoint && geoPoint.latitude && geoPoint.longitude) {
                return `${geoPoint.latitude.toFixed(
                  4
                )}° N, ${geoPoint.longitude.toFixed(4)}° E`;
              }
              return "Location not specified";
            };

            const getAlertStatus = (): AlertStatus => {
              const now = new Date();
              const alertTime = data.timestamp?.toDate();
              if (!alertTime) return "active";

              const timeDiff = now.getTime() - alertTime.getTime();
              const minutesDiff = timeDiff / (1000 * 60);

              if (minutesDiff < 5) return "active";
              if (minutesDiff < 30) return "responding";
              return "resolved";
            };

            const alertObj = {
              id: docSnapshot.id,
              audioUrl: data.audioUrl || "",
              location: formatGeoPoint(data.location),
              timestamp: data.timestamp?.toDate() || new Date(),
              userId: data.userId || "",
              status: getAlertStatus(),
              ...userInfo,
            } as PanicAlert;

            return alertObj;
          })
        );

        setAlerts(alertsFromDb);
      } catch (err) {
        console.error("Firebase fetch error:", err);
        setError("Error fetching panic alerts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPanicAlerts();
  }, []);

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "responding":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "active":
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 animate-pulse";
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        Loading panic alerts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-10 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!isLoading && filteredAlerts.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        No panic alerts found
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {filteredAlerts.map((alert) => (
        <Card
          key={alert.id}
          className={`hover:shadow-lg transition-all border-2 ${
            alert.status === "active"
              ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
              : "border-pink-100 dark:border-pink-900/20"
          } hover:border-pink-200 dark:hover:border-pink-800/30`}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    Panic Alert - {alert.userName || "Unknown User"}
                  </CardTitle>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status.charAt(0).toUpperCase() +
                      alert.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Emergency alert triggered by user
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between flex-wrap gap-4 items-center">
              <div className="flex gap-4 text-sm text-muted-foreground items-center flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Triggered: {alert.timestamp.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{alert.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog
                  onOpenChange={(isOpen) => !isOpen && setSelectedAlert(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                      className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Play Audio
                    </Button>
                  </DialogTrigger>
                  {selectedAlert && selectedAlert.id === alert.id && (
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Panic Alert Audio</DialogTitle>
                        <DialogDescription>
                          Audio recording from panic alert
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {selectedAlert.audioUrl ? (
                          <div className="bg-muted rounded-lg p-4">
                            <audio
                              src={selectedAlert.audioUrl}
                              controls
                              className="w-full"
                              autoPlay
                            >
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No audio recording available
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                <Dialog
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setSelectedAlert(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact User
                    </Button>
                  </DialogTrigger>
                  {selectedAlert && selectedAlert.id === alert.id && (
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Contact User</DialogTitle>
                        <DialogDescription>
                          Name: {selectedAlert.userName}
                          <br />
                          Phone: {selectedAlert.userPhone}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
