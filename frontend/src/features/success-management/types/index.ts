export enum NotificationType {
  WELCOME = "WELCOME",
  APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED",
  DOCUMENT_VERIFICATION = "DOCUMENT_VERIFICATION",
  APPLICATION_PROCESSING = "APPLICATION_PROCESSING",
  DOCUMENT_DELIVERED = "DOCUMENT_DELIVERED",
  NEW_FEATURE = "NEW_FEATURE",
  NEW_SERVICE = "NEW_SERVICE",
  GENERAL_ANNOUNCEMENT = "GENERAL_ANNOUNCEMENT",
}

export interface AppNotification {
  id: string;
  userId: string;
  applicationId?: string | null;
  title: string;
  message: string;
  actionUrl?: string | null;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface DeliveryResult {
  success: boolean;
  applicationId: string;
  applicationNo: string;
  serviceName: string;
  customerName: string;
  documentName: string;
  uploaded: boolean;
  statusUpdated: boolean;
  notificationCreated: boolean;
  emailSent: boolean;
  emailError: string | null;
  completedAt?: string;
}

export interface ServiceStat {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  count: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalApplications: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  totalRevenue: number;
  serviceWiseStats: ServiceStat[];
  recentlySubmitted: any[];
  recentlyCompleted: any[];
}

export interface RegisteredUser {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalApplications: number;
}

export interface UserDetailProfile extends RegisteredUser {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  welcomeNotificationSentAt?: string | null;
  applications: any[];
  completedApplicationsCount: number;
}

export interface DeliveryLogItem {
  id: string;
  applicationId?: string;
  applicationNo: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  channel: string;
  subject?: string;
  status: string;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  targetType: string;
  serviceId?: string | null;
  createdBy: string;
  createdAt: string;
}
