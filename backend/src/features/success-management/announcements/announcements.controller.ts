import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnnouncementsService } from "./announcements.service";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { GetUser } from "../../../common/decorators/get-user.decorator";
import { RoleName } from "@prisma/client";

@ApiTags("Announcements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("announcements")
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: "Get announcements list" })
  getAnnouncements() {
    return this.announcementsService.getAnnouncements();
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Admin: Publish new announcement to target users" })
  createAnnouncement(@Body() dto: CreateAnnouncementDto, @GetUser() adminUser: any) {
    return this.announcementsService.createAnnouncement(dto, adminUser);
  }
}
