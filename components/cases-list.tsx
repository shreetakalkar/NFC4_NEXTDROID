"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "@/hooks/use-translation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  GeoPoint,
  doc,
  getDoc,
  documentId,
  where,
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
  Eye,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Volume2,
  RefreshCw,
} from "lucide-react";

type CaseStatus = "pending" | "investigating" | "resolved";
type CasePriority = "low" | "medium" | "high" | "critical";

interface Case {
  id: string;
  name: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  isAnonymous: boolean;
  location: string;
  createdAt: Date;
  incidentDate: Date;
  attachmentImage?: string[];
  attachmentVideo?: string[];
  attachmentAudio?: string[];
  feedback?: string;
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterPhone?: string;
  panicScore?: number;
  uid?: string;
}

interface CasesListProps {
  searchQuery?: string;
  statusFilter?: "all" | CaseStatus;
}

// Cache for location data to avoid repeated API calls
const locationCache = new Map<string, string>();

export function CasesList({
  searchQuery = "",
  statusFilter = "all",
}: CasesListProps) {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const formatSectionContent = useCallback((content: string) => {
    if (!content?.trim()) return null;

    // Handle nested ** formatting within sections
    const parts = content.split(/(\*\*.*?\*\*)/g);
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (part.match(/^\*\*(.*?)\*\*$/)) {
        // Bold subsection
        const boldText = part
          .replace(/^\*\*(.*?)\*\*$/, "$1")
          .replace(/[:]*$/, "")
          .trim();
        if (boldText) {
          elements.push(
            <span
              key={i}
              className="font-medium text-gray-800 dark:text-gray-200 block mt-2 first:mt-0 text-sm"
            >
              {boldText}
            </span>
          );
        }
      } else {
        // Regular text
        const cleanText = part.replace(/\s+/g, " ").trim();
        if (cleanText) {
          elements.push(
            <span
              key={i}
              className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
            >
              {cleanText}
            </span>
          );
        }
      }
    }

    return elements.length > 0 ? (
      <div className="space-y-1">{elements}</div>
    ) : null;
  }, []);

  const formatDescription = useCallback((description: string) => {
    if (!description) return "No description provided.";

    const elements: React.ReactNode[] = [];
    let elementKey = 0;

    // Check if it contains the user/AI format
    const hasUserAIFormat =
      description.includes("--- USER'S INITIAL DESCRIPTION ---") ||
      description.includes("--- AI-GENERATED SUMMARY ---");

    if (hasUserAIFormat) {
      // Handle USER/AI format
      const sections = description.split(/--- (.*?) ---/);

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]?.trim();
        if (!section) continue;

        if (
          section.includes("USER'S INITIAL DESCRIPTION") ||
          section.includes("AI-GENERATED SUMMARY")
        ) {
          // Section header
          elements.push(
            <div
              key={elementKey++}
              className="font-bold text-blue-700 dark:text-blue-300 text-sm uppercase tracking-wide mt-3 first:mt-0 mb-1 border-b border-blue-200 dark:border-blue-700 pb-1"
            >
              {section.replace(/'/g, "'")}
            </div>
          );
        } else {
          // Section content
          const formattedContent = formatSectionContent(section);
          if (formattedContent) {
            elements.push(
              <div key={elementKey++} className="mb-3">
                {formattedContent}
              </div>
            );
          }
        }
      }
    } else {
      // Handle standard formats with ** or ### headers
      // Split by both ** and ### patterns
      const parts = description.split(/(\*\*.*?\*\*|###\s*.*?)(?=\n|$)/g);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]?.trim();
        if (!part) continue;

        if (part.match(/^\*\*(.*?)\*\*$/) || part.match(/^###\s*(.*?)$/)) {
          // Header section
          const headerText = part
            .replace(/^\*\*(.*?)\*\*$/, "$1")
            .replace(/^###\s*(.*?)$/, "$1")
            .replace(/[:]*$/, "")
            .trim();

          if (headerText) {
            elements.push(
              <div
                key={elementKey++}
                className="font-semibold text-gray-900 dark:text-gray-100 mt-3 first:mt-0 mb-1 text-sm"
              >
                {headerText}
              </div>
            );
          }
        } else {
          // Regular content
          const cleanContent = part
            .replace(/^\*\*.*?\*\*\s*/g, "")
            .replace(/^###\s*.*?\s*/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (cleanContent) {
            elements.push(
              <div
                key={elementKey++}
                className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2"
              >
                {cleanContent}
              </div>
            );
          }
        }
      }
    }

    return elements.length > 0 ? (
      <div className="space-y-1">{elements}</div>
    ) : (
      "No description provided."
    );
  }, []);

  // Memoized function to format GeoPoint to location string
  const formatGeoPoint = useCallback(
    async (geoPoint: GeoPoint | undefined): Promise<string> => {
      if (!geoPoint || !geoPoint.latitude || !geoPoint.longitude) {
        return "Location not specified";
      }

      const cacheKey = `${geoPoint.latitude},${geoPoint.longitude}`;

      // Check cache first
      if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey)!;
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          console.warn("Weather API key not found");
          return `${geoPoint.latitude.toFixed(4)}, ${geoPoint.longitude.toFixed(
            4
          )}`;
        }

        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${geoPoint.latitude}&lon=${geoPoint.longitude}&limit=1&appid=${apiKey}`,
          { timeout: 5000 } // 5 second timeout
        );

        const location =
          response.data?.[0]?.name ||
          `${geoPoint.latitude.toFixed(4)}, ${geoPoint.longitude.toFixed(4)}`;

        // Cache the result
        locationCache.set(cacheKey, location);
        return location;
      } catch (error) {
        console.error("Error fetching location:", error);
        const fallbackLocation = `${geoPoint.latitude.toFixed(
          4
        )}, ${geoPoint.longitude.toFixed(4)}`;
        locationCache.set(cacheKey, fallbackLocation);
        return fallbackLocation;
      }
    },
    []
  );

  // Batch fetch user data for better performance
  const fetchUsersData = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return new Map();

    try {
      // Firebase has a limit of 10 documents per 'in' query, so we need to batch
      const userDataMap = new Map();
      const batches = [];

      for (let i = 0; i < userIds.length; i += 10) {
        const batchIds = userIds.slice(i, i + 10);
        batches.push(batchIds);
      }

      for (const batchIds of batches) {
        const usersQuery = query(
          collection(db, "users"),
          where(documentId(), "in", batchIds)
        );
        const usersSnapshot = await getDocs(usersQuery);

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          userDataMap.set(doc.id, {
            reporterFirstName: userData.firstName || "",
            reporterLastName: userData.lastName || "",
            reporterPhone: userData.phoneNumber || "",
          });
        });
      }

      return userDataMap;
    } catch (error) {
      console.error("Error batch fetching users:", error);
      return new Map();
    }
  }, []);

  const fetchCases = useCallback(async () => {
    setError(null);
    try {
      const casesCollectionRef = collection(db, "cases");
      const q = query(casesCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      // Extract unique user IDs for non-anonymous cases
      const userIds = Array.from(
        new Set(
          querySnapshot.docs
            .map((doc) => doc.data())
            .filter((data) => !data.isAnonymous && data.uid)
            .map((data) => data.uid)
        )
      );

      // Batch fetch user data
      const usersDataMap = await fetchUsersData(userIds);

      // Process cases with location data
      const casesFromDb = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();

          // Get user info from batch data
          const reporterInfo =
            !data.isAnonymous && data.uid && usersDataMap.has(data.uid)
              ? usersDataMap.get(data.uid)
              : {};

          // Handle status field - it can be boolean or string
          const getStatusFromData = (statusData: any): CaseStatus => {
            if (typeof statusData === "boolean") {
              return statusData ? "resolved" : "pending";
            }
            if (typeof statusData === "string") {
              return statusData.toLowerCase() as CaseStatus;
            }
            return "pending";
          };

          // Format location asynchronously
          const location = await formatGeoPoint(
            data.incidentLocation || data.currentLocation
          );

          const caseObj: Case = {
            id: docSnapshot.id,
            name: data.name || "No Title",
            description: data.description || "No description provided.",
            status: getStatusFromData(data.status),
            priority: (data.priority || "low") as CasePriority,
            isAnonymous: data.isAnonymous || false,
            location,
            attachmentImage: data.attachmentImage || [],
            attachmentVideo: data.attachmentVideo || [],
            attachmentAudio: data.attachmentAudio || [],
            feedback: data.feedback,
            createdAt: data.createdAt?.toDate() || new Date(),
            incidentDate: data.incidentDate?.toDate() || new Date(),
            panicScore: data.panicScore,
            uid: data.uid,
            ...reporterInfo,
          };

          return caseObj;
        })
      );

      setCases(casesFromDb);
    } catch (err) {
      console.error("Firebase fetch error:", err);
      setError(t("common.error_fetching_cases"));
    }
  }, [t, formatGeoPoint, fetchUsersData]);

  useEffect(() => {
    const loadCases = async () => {
      setIsLoading(true);
      await fetchCases();
      setIsLoading(false);
    };

    loadCases();
  }, [fetchCases]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCases();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "investigating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    }
  };

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-300";
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-300";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-300";
      case "low":
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20 dark:text-gray-300";
    }
  };

  const getPanicScoreColor = (score: number | undefined) => {
    if (!score && score !== 0) {
      return "bg-gray-400 text-black dark:bg-gray-400 dark:text-black";
    }

    if (score >= 75) {
      return "bg-rose-600 text-white dark:bg-rose-600 dark:text-white";
    } else if (score >= 50) {
      return "bg-amber-400 text-black dark:bg-amber-400 dark:text-black";
    } else if (score >= 25) {
      return "bg-green-500 text-white dark:bg-green-500 dark:text-white";
    } else {
      return "bg-gray-400 text-black dark:bg-gray-400 dark:text-black";
    }
  };

  const getAttachmentCount = useCallback((case_: Case) => {
    const imageCount = case_.attachmentImage?.length || 0;
    const videoCount = case_.attachmentVideo?.length || 0;
    const audioCount = case_.attachmentAudio?.length || 0;
    return imageCount + videoCount + audioCount;
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((case_) => {
      const matchesSearch =
        case_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || case_.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        {t("common.loading_cases")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-10 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!isLoading && filteredCases.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        <p className="mb-4">{t("common.no_cases_found")}</p>
        {cases.length === 0 && (
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh ({filteredCases.length})
        </Button>
      </div>

      {filteredCases.map((case_) => (
        <Card
          key={case_.id}
          className="hover:shadow-lg transition-all border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                    {case_.name}
                  </CardTitle>
                  <Badge className={getPriorityColor(case_.priority)}>
                    {case_.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(case_.status)}>
                    {case_.status.toUpperCase()}
                  </Badge>
                  {case_.panicScore !== undefined && (
                    <Badge className={getPanicScoreColor(case_.panicScore)}>
                      Panic: {case_.panicScore.toFixed(2)}
                    </Badge>
                  )}
                  {case_.isAnonymous ? (
                    <Badge
                      variant="outline"
                      className="border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300"
                    >
                      Anonymous
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                    >
                      Not Anonymous
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {formatDescription(case_.description)}
                </CardDescription>
              </div>
              {case_.incidentDate && (
                <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{case_.incidentDate.toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between flex-wrap gap-4 items-center">
              <div className="flex gap-4 text-sm text-muted-foreground items-center flex-wrap">
                {case_.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>
                      Submitted: {case_.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{case_.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{getAttachmentCount(case_)} Attachments</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog
                  onOpenChange={(isOpen) => !isOpen && setSelectedCase(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCase(case_)}
                      className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Evidence
                    </Button>
                  </DialogTrigger>
                  {selectedCase && selectedCase.id === case_.id && (
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Evidence Files</DialogTitle>
                        <DialogDescription>
                          View case attachments for "{selectedCase.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {/* Image Attachments */}
                        {selectedCase.attachmentImage &&
                          selectedCase.attachmentImage.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                <h3 className="text-md font-medium">
                                  Image Evidence (
                                  {selectedCase.attachmentImage.length})
                                </h3>
                              </div>
                              {selectedCase.attachmentImage.map(
                                (imageUrl, index) => (
                                  <div
                                    key={`img-${index}`}
                                    className="bg-muted rounded-lg overflow-hidden border"
                                  >
                                    <div className="relative w-full aspect-video">
                                      <img
                                        src={imageUrl}
                                        alt={`Image Evidence ${index + 1}`}
                                        className="w-full h-full object-contain rounded-lg"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* Video Attachments */}
                        {selectedCase.attachmentVideo &&
                          selectedCase.attachmentVideo.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Video className="h-5 w-5" />
                                <h3 className="text-md font-medium">
                                  Video Evidence (
                                  {selectedCase.attachmentVideo.length})
                                </h3>
                              </div>
                              {selectedCase.attachmentVideo.map(
                                (videoUrl, index) => (
                                  <div
                                    key={`vid-${index}`}
                                    className="bg-muted rounded-lg overflow-hidden border"
                                  >
                                    <video
                                      src={videoUrl}
                                      controls
                                      className="w-full aspect-video rounded-lg"
                                      preload="metadata"
                                    >
                                      Your browser does not support the video
                                      tag.
                                    </video>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* Audio Attachments */}
                        {selectedCase.attachmentAudio &&
                          selectedCase.attachmentAudio.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-5 w-5" />
                                <h3 className="text-md font-medium">
                                  Audio Evidence (
                                  {selectedCase.attachmentAudio.length})
                                </h3>
                              </div>
                              {selectedCase.attachmentAudio.map(
                                (audioUrl, index) => (
                                  <div
                                    key={`aud-${index}`}
                                    className="bg-muted rounded-lg overflow-hidden border p-4"
                                  >
                                    <audio
                                      src={audioUrl}
                                      controls
                                      className="w-full"
                                      preload="metadata"
                                    >
                                      Your browser does not support the audio
                                      tag.
                                    </audio>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* No attachments */}
                        {(!selectedCase.attachmentImage ||
                          selectedCase.attachmentImage.length === 0) &&
                          (!selectedCase.attachmentVideo ||
                            selectedCase.attachmentVideo.length === 0) &&
                          (!selectedCase.attachmentAudio ||
                            selectedCase.attachmentAudio.length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No evidence provided
                            </p>
                          )}
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                {!case_.isAnonymous && (
                  <Dialog
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setSelectedCase(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={() => setSelectedCase(case_)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </DialogTrigger>
                    {selectedCase && selectedCase.id === case_.id && (
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Contact Case Owner</DialogTitle>
                          <DialogDescription>
                            <strong>Case:</strong> {selectedCase.name}
                            <br />
                            <strong>Name:</strong>{" "}
                            {`${selectedCase.reporterFirstName || ""} ${
                              selectedCase.reporterLastName || ""
                            }`.trim() || "Not provided"}
                            <br />
                            <strong>Phone:</strong>{" "}
                            {selectedCase.reporterPhone || "Not provided"}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    )}
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
