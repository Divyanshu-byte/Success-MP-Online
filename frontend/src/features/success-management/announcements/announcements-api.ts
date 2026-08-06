import { apiRequest } from "@/lib/apiClient";
import { AnnouncementItem } from "../types";

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  actionUrl?: string;
  targetType?: string; // "ALL" | "SERVICE" | "USER"
  serviceId?: string;
  userId?: string;
  sendEmail?: boolean;
}

export async function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  return apiRequest<AnnouncementItem[]>("/announcements");
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
): Promise<{ success: boolean; targetCount: number; dispatchedCount: number }> {
  return apiRequest<{ success: boolean; targetCount: number; dispatchedCount: number }>(
    "/announcements",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
