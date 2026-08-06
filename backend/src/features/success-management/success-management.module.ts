import { Module } from "@nestjs/common";
import { MailModule } from "../../mail/mail.module";

// Notifications
import { NotificationEngineService } from "./notifications/notification-engine.service";
import { NotificationsController } from "./notifications/notifications.controller";

// Document Delivery
import { DocumentDeliveryService } from "./document-delivery/document-delivery.service";
import { DocumentDeliveryController } from "./document-delivery/document-delivery.controller";

// Announcements
import { AnnouncementsService } from "./announcements/announcements.service";
import { AnnouncementsController } from "./announcements/announcements.controller";

// Welcome
import { WelcomeService } from "./welcome/welcome.service";

// Admin
import { AdminStatsService } from "./admin/admin-stats.service";
import { AdminUsersService } from "./admin/admin-users.service";
import { SuccessAdminController } from "./admin/success-admin.controller";

// Delivery Logs
import { DeliveryLogsService } from "./delivery-logs/delivery-logs.service";
import { DeliveryLogsController } from "./delivery-logs/delivery-logs.controller";

@Module({
  imports: [MailModule],
  controllers: [
    NotificationsController,
    DocumentDeliveryController,
    AnnouncementsController,
    SuccessAdminController,
    DeliveryLogsController,
  ],
  providers: [
    NotificationEngineService,
    DocumentDeliveryService,
    AnnouncementsService,
    WelcomeService,
    AdminStatsService,
    AdminUsersService,
    DeliveryLogsService,
  ],
  exports: [
    NotificationEngineService,
    WelcomeService,
    DocumentDeliveryService,
  ],
})
export class SuccessManagementModule {}
