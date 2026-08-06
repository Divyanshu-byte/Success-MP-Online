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

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  applicationId?: string;
  actionUrl?: string;
  sendEmail?: boolean;
  emailSubject?: string;
}
