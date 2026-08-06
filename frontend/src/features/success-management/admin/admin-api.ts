import { apiRequest } from "@/lib/apiClient";
import { AdminDashboardStats, RegisteredUser, UserDetailProfile, DeliveryLogItem } from "../types";

export async function fetchAdminStats(): Promise<AdminDashboardStats> {
  return apiRequest<AdminDashboardStats>("/admin/success/stats");
}

export async function fetchAdminUsers(search?: string): Promise<RegisteredUser[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest<RegisteredUser[]>(`/admin/success/users${query}`);
}

export async function fetchAdminUserById(id: string): Promise<UserDetailProfile> {
  return apiRequest<UserDetailProfile>(`/admin/success/users/${id}`);
}

export async function fetchDeliveryLogs(): Promise<DeliveryLogItem[]> {
  return apiRequest<DeliveryLogItem[]>("/admin/delivery-logs");
}
