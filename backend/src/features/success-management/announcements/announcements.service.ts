import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { NotificationEngineService } from "../notifications/notification-engine.service";
import { NotificationType } from "../notifications/notification.types";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationEngine: NotificationEngineService,
  ) {}

  async createAnnouncement(dto: CreateAnnouncementDto, adminUser: any) {
    // 1. Create Announcement Record
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        message: dto.message,
        actionUrl: dto.actionUrl || "/#services",
        targetType: dto.targetType || "ALL",
        serviceId: dto.serviceId || null,
        createdBy: adminUser.id,
      },
    });

    // 2. Identify target user IDs
    let targetUserIds: string[] = [];

    if (dto.targetType === "USER" && dto.userId) {
      targetUserIds = [dto.userId];
    } else if (dto.targetType === "SERVICE" && dto.serviceId) {
      const apps = await this.prisma.application.findMany({
        where: { serviceId: dto.serviceId },
        select: { userId: true },
        distinct: ["userId"],
      });
      targetUserIds = apps.map((a) => a.userId);
    } else {
      // ALL users
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    }

    // 3. Dispatch notifications in batch
    let successCount = 0;
    for (const uId of targetUserIds) {
      try {
        await this.notificationEngine.createNotification({
          userId: uId,
          title: dto.title,
          message: dto.message,
          type: NotificationType.GENERAL_ANNOUNCEMENT,
          actionUrl: dto.actionUrl || "/#services",
          sendEmail: dto.sendEmail,
          emailSubject: `📢 ${dto.title} - Success MP Online`,
        });
        successCount++;
      } catch (err: any) {
        this.logger.error(`Error sending announcement to user ${uId}: ${err.message}`);
      }
    }

    return {
      success: true,
      announcement,
      targetCount: targetUserIds.length,
      dispatchedCount: successCount,
    };
  }

  async getAnnouncements() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
