import { apiRequest } from "@/lib/apiClient";
import { NotificationResponse } from "../types";

export async function fetchNotifications(): Promise<NotificationResponse> {
  return apiRequest<NotificationResponse>("/notifications");
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/notifications/read-all", {
    method: "PATCH",
  });
}
