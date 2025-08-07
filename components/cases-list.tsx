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
  AlertTriangle,
  Shield,
  Users,
  ChevronDown,
  ChevronRight,
  FileSearch,
  Scale,
} from "lucide-react";
import { formatDescription, formatEvidenceAnalysis } from "@/lib/descriptionFormatter";
import { useRouter } from "next/navigation";

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
  harasserName?: string;
  harasserReportCount?: number;
  isHighRiskHarasser?: boolean;
  futureDate?: Date; // Optional field for future incidents
  normalizedName?: string; // Normalized harasser name for grouping
  evidence_analysis?: string; // Optional field for evidence analysis
  justification?: string; // Optional field for justification
}

interface AggregatedCase {
  harasserName: string;
  normalizedName: string;
  cases: Case[];
  totalReports: number;
  highestPriority: CasePriority;
  latestIncidentDate: Date;
  totalPanicScore: number;
  averagePanicScore: number;
  locations: string[];
  isHighRisk: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  statusCounts: Record<CaseStatus, number>;
  totalAttachments: number;
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
  const router = useRouter();
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [aggregatedCases, setAggregatedCases] = useState<AggregatedCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Memoized function to format GeoPoint to location string
  const formatGeoPoint = useCallback(
    async (geoPoint: GeoPoint | undefined): Promise<string> => {
      if (!geoPoint || !geoPoint.latitude || !geoPoint.longitude) {
        return "";
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

  // Function to normalize harasser names
  const normalizeHarasserName = useCallback((name: string): string => {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
  }, []);

  // Batch fetch user data for better performance
  const fetchUsersData = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return new Map();

    try {
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

  // Function to get priority weight for sorting
  const getPriorityWeight = useCallback((priority: CasePriority): number => {
    switch (priority.toLowerCase()) {
      case "critical":
        return 4;
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }, []);

  // Function to determine risk level based on report count and other factors
  const calculateRiskLevel = useCallback(
    (
      reportCount: number,
      averagePanicScore: number,
      highestPriority: CasePriority
    ): "low" | "medium" | "high" | "critical" => {
      const priorityWeight = getPriorityWeight(highestPriority);

      if (
        reportCount >= 10 ||
        (reportCount >= 5 && averagePanicScore >= 75) ||
        priorityWeight >= 4
      ) {
        return "critical";
      } else if (
        reportCount >= 5 ||
        (reportCount >= 3 && averagePanicScore >= 50) ||
        priorityWeight >= 3
      ) {
        return "high";
      } else if (
        reportCount >= 3 ||
        averagePanicScore >= 40 ||
        priorityWeight >= 2
      ) {
        return "medium";
      } else {
        return "low";
      }
    },
    [getPriorityWeight]
  );

  // Function to aggregate cases by harasser name
  const aggregateCases = useCallback(
    (cases: Case[]): AggregatedCase[] => {
      const grouped = new Map<string, Case[]>();

      // Group cases by normalized harasser name
      cases.forEach((case_) => {
        const harasserName = case_.harasserName;
        if (harasserName && harasserName.trim()) {
          const normalizedName = normalizeHarasserName(harasserName);
          if (!grouped.has(normalizedName)) {
            grouped.set(normalizedName, []);
          }
          grouped.get(normalizedName)!.push(case_);
        }
      });

      // Create aggregated cases
      const aggregated: AggregatedCase[] = Array.from(grouped.entries()).map(
        ([normalizedName, casesGroup]) => {
          const totalReports = casesGroup.length;
          const harasserName = casesGroup[0].harasserName || "Unknown";

          // Calculate highest priority
          const highestPriority = casesGroup.reduce((highest, case_) => {
            return getPriorityWeight(case_.priority) >
              getPriorityWeight(highest)
              ? case_.priority
              : highest;
          }, "low" as CasePriority);

          // Calculate latest incident date
          const latestIncidentDate = casesGroup.reduce((latest, case_) => {
            return case_.incidentDate > latest ? case_.incidentDate : latest;
          }, new Date(0));

          // Calculate panic scores
          const validPanicScores = casesGroup
            .filter((c) => c.panicScore !== undefined)
            .map((c) => c.panicScore!);
          const totalPanicScore = validPanicScores.reduce(
            (sum, score) => sum + score,
            0
          );
          const averagePanicScore =
            validPanicScores.length > 0
              ? totalPanicScore / validPanicScores.length
              : 0;

          // Get unique locations
          const locations = Array.from(
            new Set(casesGroup.map((c) => c.location))
          );

          // Calculate status counts
          const statusCounts = casesGroup.reduce((counts, case_) => {
            counts[case_.status] = (counts[case_.status] || 0) + 1;
            return counts;
          }, {} as Record<CaseStatus, number>);

          // Calculate total attachments
          const totalAttachments = casesGroup.reduce((total, case_) => {
            const imageCount = case_.attachmentImage?.length || 0;
            const videoCount = case_.attachmentVideo?.length || 0;
            const audioCount = case_.attachmentAudio?.length || 0;
            return total + imageCount + videoCount + audioCount;
          }, 0);

          // Determine risk level
          const riskLevel = calculateRiskLevel(
            totalReports,
            averagePanicScore,
            highestPriority
          );
          const isHighRisk = riskLevel === "critical" || riskLevel === "high";

          return {
            harasserName,
            normalizedName,
            cases: casesGroup.sort(
              (a, b) => b.incidentDate.getTime() - a.incidentDate.getTime()
            ),
            totalReports,
            highestPriority,
            latestIncidentDate,
            totalPanicScore,
            averagePanicScore,
            locations,
            isHighRisk,
            riskLevel,
            statusCounts,
            totalAttachments,
          };
        }
      );

      // Sort by importance (risk level, then by report count, then by latest incident)
      return aggregated.sort((a, b) => {
        // First sort by risk level (critical > high > medium > low)
        const riskWeights = { critical: 4, high: 3, medium: 2, low: 1 };
        const riskDiff = riskWeights[b.riskLevel] - riskWeights[a.riskLevel];
        if (riskDiff !== 0) return riskDiff;

        // Then by total reports (descending)
        const reportDiff = b.totalReports - a.totalReports;
        if (reportDiff !== 0) return reportDiff;

        // Finally by latest incident date (most recent first)
        return b.latestIncidentDate.getTime() - a.latestIncidentDate.getTime();
      });
    },
    [normalizeHarasserName, getPriorityWeight, calculateRiskLevel]
  );

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

          // Handle status field
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

          // Extract harasser information
          const harasserName = data.name;

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
            harasserName: harasserName,
            evidence_analysis: data.evidence_analysis,
            justification: data.justification,
            ...reporterInfo,
          };

          return caseObj;
        })
      );

      setCases(casesFromDb);
      setAggregatedCases(aggregateCases(casesFromDb));
    } catch (err) {
      console.error("Firebase fetch error:", err);
      setError(t("common.error_fetching_cases"));
    }
  }, [t, formatGeoPoint, fetchUsersData, aggregateCases]);

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

  const toggleGroupExpansion = (normalizedName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(normalizedName)) {
      newExpanded.delete(normalizedName);
    } else {
      newExpanded.add(normalizedName);
    }
    setExpandedGroups(newExpanded);
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

  const getRiskLevelColor = (
    riskLevel: "low" | "medium" | "high" | "critical"
  ) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-600 text-white border-red-700";
      case "high":
        return "bg-red-500 text-white border-red-600";
      case "medium":
        return "bg-orange-500 text-white border-orange-600";
      case "low":
      default:
        return "bg-yellow-500 text-black border-yellow-600";
    }
  };

  const getGroupCardStyling = (
    riskLevel: "low" | "medium" | "high" | "critical"
  ) => {
    switch (riskLevel) {
      case "critical":
        return "border-red-500 bg-red-50/50 dark:bg-red-950/30 shadow-red-100 dark:shadow-red-900/20";
      case "high":
        return "border-red-400 bg-red-50/30 dark:bg-red-950/20 shadow-red-50 dark:shadow-red-900/10";
      case "medium":
        return "border-orange-400 bg-orange-50/30 dark:bg-orange-950/20";
      case "low":
      default:
        return "border-yellow-300 bg-yellow-50/20 dark:bg-yellow-950/10";
    }
  };

  const getAttachmentCount = useCallback((case_: Case) => {
    const imageCount = case_.attachmentImage?.length || 0;
    const videoCount = case_.attachmentVideo?.length || 0;
    const audioCount = case_.attachmentAudio?.length || 0;
    return imageCount + videoCount + audioCount;
  }, []);

  const filteredAggregatedCases = useMemo(() => {
    return aggregatedCases.filter((aggregated) => {
      const matchesSearch =
        aggregated.harasserName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        aggregated.cases.some(
          (case_) =>
            case_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            case_.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            case_.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        aggregated.cases.some((case_) => case_.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [aggregatedCases, searchQuery, statusFilter]);

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

  if (!isLoading && filteredAggregatedCases.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        <p className="mb-4">{t("common.no_cases_found")}</p>
        {aggregatedCases.length === 0 && (
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
          Refresh ({filteredAggregatedCases.length} suspects,{" "}
          {cases.filter((c) => c.harasserName).length} total cases)
        </Button>
      </div>

      {filteredAggregatedCases.map((aggregated) => (
        <Card
          key={aggregated.normalizedName}
          className={`${getGroupCardStyling(
            aggregated.riskLevel
          )} hover:shadow-lg transition-all`}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleGroupExpansion(aggregated.normalizedName)
                    }
                    className="p-1 h-8 w-8"
                  >
                    {expandedGroups.has(aggregated.normalizedName) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Suspect: {aggregated.harasserName}
                  </CardTitle>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <Badge className={getRiskLevelColor(aggregated.riskLevel)}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {aggregated.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="destructive">
                    <Users className="h-3 w-3 mr-1" />
                    {aggregated.totalReports} Reports
                  </Badge>
                  <Badge
                    className={getPriorityColor(aggregated.highestPriority)}
                  >
                    Highest Priority: {aggregated.highestPriority.toUpperCase()}
                  </Badge>
                  {aggregated.averagePanicScore > 0 && (
                    <Badge
                      variant="outline"
                      className="border-purple-200 text-purple-700"
                    >
                      Avg Panic: {aggregated.averagePanicScore.toFixed(1)}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {aggregated.totalAttachments} Evidence Files
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status Distribution:
                    </span>
                    <div className="flex gap-1 mt-1">
                      {Object.entries(aggregated.statusCounts).map(
                        ([status, count]) => (
                          <Badge
                            key={status}
                            className={getStatusColor(status as CaseStatus)}
                            variant="secondary"
                          >
                            {status}: {count}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Locations ({aggregated.locations.length}):
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {aggregated.locations.slice(0, 2).join(", ")}
                      {aggregated.locations.length > 2 &&
                        ` +${aggregated.locations.length - 2} more`}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Latest Incident:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {aggregated.latestIncidentDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {aggregated.riskLevel === "critical" && (
                  <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-950/50 rounded-md border border-red-300 dark:border-red-700">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      CRITICAL THREAT: This suspect has{" "}
                      {aggregated.totalReports} reports with high risk
                      indicators. Immediate attention required.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Expanded individual cases */}
          {expandedGroups.has(aggregated.normalizedName) && (
            <CardContent>
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Individual Cases ({aggregated.cases.length}):
                </h4>
                {aggregated.cases.map(
                  (case_) =>
                    (!case_.futureDate || case_.futureDate > new Date()) && (
                      <Card
                        key={case_.id}
                        className="border-l-4 border-l-rose-500 bg-white dark:bg-gray-950"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                  {case_.name}
                                </CardTitle>
                                <Badge
                                  className={getPriorityColor(case_.priority)}
                                >
                                  {case_.priority.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(case_.status)}>
                                  {case_.status.toUpperCase()}
                                </Badge>
                                {case_.panicScore !== undefined && (
                                  <Badge
                                    variant="outline"
                                    className="border-purple-200 text-purple-700"
                                  >
                                    Panic: {case_.panicScore.toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="text-gray-600 dark:text-gray-400">
                                {formatDescription(case_.description)}
                              </CardDescription>
                              {case_.justification && (
                                <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                  <div className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                      Case Justification
                                    </h3>
                                  </div>
                                  <div className="text-sm text-green-900 dark:text-green-100 leading-relaxed whitespace-pre-wrap">
                                    {case_.justification}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground text-right flex-shrink-0">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {case_.incidentDate.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between flex-wrap gap-4 items-center">
                            <div className="flex gap-4 text-sm text-muted-foreground items-center flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-4 w-4" />
                                <span>
                                  Submitted:{" "}
                                  {case_.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{case_.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>
                                  {getAttachmentCount(case_)} Attachments
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Dialog
                                onOpenChange={(isOpen) =>
                                  !isOpen && setSelectedCase(null)
                                }
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
                                {selectedCase &&
                                  selectedCase.id === case_.id && (
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Case Evidence & Analysis
                                        </DialogTitle>
                                        <DialogDescription>
                                          Comprehensive review for case "
                                          {selectedCase.name}"
                                          {selectedCase.harasserName && (
                                            <>
                                              <br />
                                              <span className="font-medium">
                                                Suspect:{" "}
                                              </span>
                                              <span className="text-red-600 font-semibold">
                                                {selectedCase.harasserName}
                                              </span>
                                            </>
                                          )}
                                        </DialogDescription>
                                      </DialogHeader>

                                      {/* Image Attachments */}
                                      {selectedCase.attachmentImage &&
                                        selectedCase.attachmentImage.length >
                                          0 && (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                              <ImageIcon className="h-5 w-5" />
                                              <h3 className="text-md font-medium">
                                                Image Evidence (
                                                {
                                                  selectedCase.attachmentImage
                                                    .length
                                                }
                                                )
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
                                                      alt={`Image Evidence ${
                                                        index + 1
                                                      }`}
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
                                        selectedCase.attachmentVideo.length >
                                          0 && (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                              <Video className="h-5 w-5" />
                                              <h3 className="text-md font-medium">
                                                Video Evidence (
                                                {
                                                  selectedCase.attachmentVideo
                                                    .length
                                                }
                                                )
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
                                                    Your browser does not
                                                    support the video tag.
                                                  </video>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Audio Attachments */}
                                      {selectedCase.attachmentAudio &&
                                        selectedCase.attachmentAudio.length >
                                          0 && (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                              <Volume2 className="h-5 w-5" />
                                              <h3 className="text-md font-medium">
                                                Audio Evidence (
                                                {
                                                  selectedCase.attachmentAudio
                                                    .length
                                                }
                                                )
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
                                                    Your browser does not
                                                    support the audio tag.
                                                  </audio>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                      <div className="space-y-6 py-4">
                                        {/* Evidence Analysis Block */}
                                        {selectedCase.evidence_analysis && (
                                          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-2">
                                              <FileSearch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                                Evidence Analysis
                                              </h3>
                                            </div>
                                            <div className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed whitespace-pre-wrap">
                                              {formatEvidenceAnalysis(
                                                selectedCase.evidence_analysis
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* No content message */}
                                        {!selectedCase.evidence_analysis &&
                                          !selectedCase.justification &&
                                          (!selectedCase.attachmentImage ||
                                            selectedCase.attachmentImage
                                              .length === 0) &&
                                          (!selectedCase.attachmentVideo ||
                                            selectedCase.attachmentVideo
                                              .length === 0) &&
                                          (!selectedCase.attachmentAudio ||
                                            selectedCase.attachmentAudio
                                              .length === 0) && (
                                            <div className="text-center py-8">
                                              <p className="text-sm text-muted-foreground">
                                                No evidence, analysis, or
                                                justification provided
                                              </p>
                                            </div>
                                          )}
                                      </div>
                                    </DialogContent>
                                  )}
                              </Dialog>

                              {/* Escalate to Police Button - moved outside Dialog */}
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  // Add escalation logic here
                                  router.push(
                                    "https://mumbaipolice.gov.in/CAWU"
                                  );
                                }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Escalate to Police
                              </Button>

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
                                  {selectedCase &&
                                    selectedCase.id === case_.id && (
                                      <DialogContent className="max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Contact Case Owner
                                          </DialogTitle>
                                          <DialogDescription>
                                            <strong>Case:</strong>{" "}
                                            {selectedCase.name}
                                            <br />
                                            <strong>Name:</strong>{" "}
                                            {`${
                                              selectedCase.reporterFirstName ||
                                              ""
                                            } ${
                                              selectedCase.reporterLastName ||
                                              ""
                                            }`.trim() || "Not provided"}
                                            <br />
                                            <strong>Phone:</strong>{" "}
                                            {selectedCase.reporterPhone ||
                                              "Not provided"}
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
                    )
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
