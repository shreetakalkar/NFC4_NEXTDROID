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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Send,
  Image as ImageIcon,
  Video,
  Volume2,
} from "lucide-react";
import Image from "next/image";

type CaseStatus = "pending" | "investigating" | "resolved";
type CasePriority = "low" | "medium" | "high" | "urgent";

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
  // Details for the person who reported the case
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterPhone?: string;
}

interface CasesListProps {
  searchQuery?: string;
  statusFilter?: "all" | CaseStatus;
}

export function CasesList({
  searchQuery = "",
  statusFilter = "all",
}: CasesListProps) {
  const { t } = useTranslation();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<string>("email");

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const casesCollectionRef = collection(db, "cases");
        const q = query(casesCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const casesFromDb = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            let reporterInfo = {};

            // Fetch user data only for non-anonymous cases
            if (!data.isAnonymous && data.uid) {
              try {
                const userDocRef = doc(db, "users", data.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  reporterInfo = {
                    reporterFirstName: userData.firstName || "",
                    reporterLastName: userData.lastName || "",
                    reporterPhone: userData.phoneNumber || "",
                  };
                  console.log(reporterInfo);
                }
              } catch (userError) {
                console.error("Error fetching user data:", userError);
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

            return {
              id: docSnapshot.id,
              name: data.name || "No Title",
              description: data.description || "No description provided.",
              status: getStatusFromData(data.status),
              priority: (data.priority?.toLowerCase() || "low") as CasePriority,
              isAnonymous: data.isAnonymous || false,
              location: formatGeoPoint(
                data.incidentLocation || data.currentLocation
              ),
              attachmentImage: data.attachmentImage || [],
              attachmentVideo: data.attachmentVideo || [],
              attachmentAudio: data.attachmentAudio || [],
              feedback: data.feedback,
              createdAt: data.createdAt?.toDate(),
              incidentDate: data.incidentDate?.toDate(),
              ...reporterInfo,
            } as Case;
          })
        );
        setCases(casesFromDb);
      } catch (err) {
        console.error("Firebase fetch error:", err);
        setError(t("common.error_fetching_cases"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [t]);

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
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300";
      case "low":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getAttachmentCount = (case_: Case) => {
    const imageCount = case_.attachmentImage?.length || 0;
    const videoCount = case_.attachmentVideo?.length || 0;
    const audioCount = case_.attachmentAudio?.length || 0;
    return imageCount + videoCount + audioCount;
  };

  const handleContactSubmit = () => {
    console.log("Contact submitted:", {
      caseId: selectedCase?.id,
      method: contactMethod,
      message: contactMessage,
    });

    setContactMessage("");
    setContactMethod("email");
    setSelectedCase(null);
    alert(t("cases.contact_sent_successfully"));
  };

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <p>{error}</p>
      </div>
    );
  }

  if (!isLoading && filteredCases.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        {t("common.no_cases_found")}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
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
                    {t(`priority.${case_.priority}`)}
                  </Badge>
                  <Badge className={getStatusColor(case_.status)}>
                    {t(`status.${case_.status}`)}
                  </Badge>
                  {case_.isAnonymous ? (
                    <Badge
                      variant="outline"
                      className="border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300"
                    >
                      {t("cases.anonymous")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                    >
                      {t("cases.notAnonymous")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {case_.description}
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
                      {t("cases.submitted")}:{" "}
                      {case_.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{case_.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>
                    {getAttachmentCount(case_)} {t("cases.attachments_items")}
                  </span>
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
                      {t("cases.view_evidence")}
                    </Button>
                  </DialogTrigger>
                  {selectedCase && selectedCase.id === case_.id && (
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t("cases.evidence_files")}</DialogTitle>
                        <DialogDescription>
                          {t("cases.view_case_attachments")}
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
                                  Image Evidence
                                </h3>
                              </div>
                              {selectedCase.attachmentImage.map(
                                (imageUrl, index) => (
                                  <div
                                    key={`img-${index}`}
                                    className="bg-muted rounded-lg overflow-hidden border"
                                  >
                                    <div className="relative w-full aspect-video">
                                      <Image
                                        src={imageUrl}
                                        alt={`Image Evidence ${index + 1}`}
                                        fill
                                        style={{ objectFit: "contain" }}
                                        className="rounded-lg"
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
                                  Video Evidence
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
                                  Audio Evidence
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
                              {t("cases.no_evidence_provided")}
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
                        setContactMessage("");
                        setContactMethod("email");
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
                        {t("cases.contact")}
                      </Button>
                    </DialogTrigger>
                    {selectedCase && selectedCase.id === case_.id && (
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {t("cases.contact_case_owner")}
                          </DialogTitle>
                          <DialogDescription>
                            Name: {`${selectedCase.reporterFirstName || ""} ${
                              selectedCase.reporterLastName || ""
                            }`.trim() || "Not provided"}
                            <br />
                            Phone No.: {selectedCase.reporterPhone || "Not provided"}
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