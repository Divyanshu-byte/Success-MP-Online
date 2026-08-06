import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { MailService } from "../../../mail/mail.service";
import { NotificationChannel, NotificationStatus, NotificationType as PrismaNotificationType } from "@prisma/client";
import { CreateNotificationParams, NotificationType } from "./notification.types";

@Injectable()
export class NotificationEngineService {
  private readonly logger = new Logger(NotificationEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Central entrypoint to dispatch notifications (in-app + optional email).
   */
  async createNotification(params: CreateNotificationParams) {
    const {
      userId,
      title,
      message,
      type = NotificationType.GENERAL_ANNOUNCEMENT,
      applicationId,
      actionUrl,
      sendEmail = false,
      emailSubject,
    } = params;

    // 1. Create In-App Notification in DB
    const prismaType = (type as string) as PrismaNotificationType;

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        applicationId: applicationId || null,
        title,
        message,
        actionUrl: actionUrl || null,
        type: prismaType,
        isRead: false,
      },
      include: {
        user: { include: { profile: true } },
        application: { include: { service: true } },
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    // 2. Dispatch Email if requested
    if (sendEmail) {
      const recipientEmail = notification.user?.email;
      if (recipientEmail) {
        const subject = emailSubject || title;
        
        let logRecordId: string | null = null;
        try {
          const logRecord = await this.prisma.notificationLog.create({
            data: {
              notificationId: notification.id,
              applicationId: applicationId || null,
              channel: NotificationChannel.EMAIL,
              recipient: recipientEmail,
              subject,
              content: message,
              status: NotificationStatus.PENDING,
            },
          });
          logRecordId = logRecord.id;
        } catch (dbErr: any) {
          this.logger.warn(`Failed to write initial NotificationLog: ${dbErr.message}`);
        }

        try {
          // Trigger MailService send confirmation / generic mail
          const mailResult = await this.mailService.sendApplicationConfirmationEmail({
            to: recipientEmail,
            applicantName: notification.user?.profile?.fullName || "User",
            applicationNo: notification.application?.applicationNo || "ALERT",
            serviceName: notification.application?.service?.name || "Success MP Online",
            createdAt: new Date(),
            status: "NOTIFICATION",
          });

          emailSent = mailResult.success;
          emailError = mailResult.error || null;

          if (logRecordId) {
            await this.prisma.notificationLog.update({
              where: { id: logRecordId },
              data: {
                status: emailSent ? NotificationStatus.SENT : NotificationStatus.FAILED,
                error: emailError,
                sentAt: emailSent ? new Date() : null,
              },
            }).catch(() => {});
          }
        } catch (err: any) {
          emailError = err.message || String(err);
          this.logger.error(`Failed sending email notification: ${emailError}`);
        }
      } else {
        emailError = "Recipient email missing";
      }
    }

    return {
      notification,
      emailSent,
      emailError,
    };
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      return { success: false, message: "Notification not found" };
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }
}
