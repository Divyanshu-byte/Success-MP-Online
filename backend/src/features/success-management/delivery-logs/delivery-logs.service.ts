import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class DeliveryLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeliveryLogs() {
    const logs = await this.prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        notification: {
          include: {
            user: { include: { profile: true } },
            application: { include: { service: true } },
          },
        },
      },
    });

    return logs.map((log) => {
      const app = log.notification?.application;
      const user = log.notification?.user;
      return {
        id: log.id,
        applicationId: log.applicationId || app?.id,
        applicationNo: app?.applicationNo || "N/A",
        serviceName: app?.service?.name || "General Notification",
        customerName: user?.profile?.fullName || user?.email || "Customer",
        customerEmail: log.recipient,
        channel: log.channel,
        subject: log.subject,
        status: log.status,
        error: log.error,
        sentAt: log.sentAt,
        createdAt: log.createdAt,
      };
    });
  }
}
