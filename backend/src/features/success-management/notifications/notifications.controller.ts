import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationEngineService } from "./notification-engine.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { GetUser } from "../../../common/decorators/get-user.decorator";

@ApiTags("Success Management Notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationEngine: NotificationEngineService) {}

  @Get()
  @ApiOperation({ summary: "Get customer notifications & unread count" })
  getNotifications(@GetUser("id") userId: string) {
    return this.notificationEngine.getUserNotifications(userId);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markAsRead(@GetUser("id") userId: string, @Param("id") id: string) {
    return this.notificationEngine.markAsRead(userId, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllAsRead(@GetUser("id") userId: string) {
    return this.notificationEngine.markAllAsRead(userId);
  }
}
