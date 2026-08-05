import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";
import { RoleName } from "@prisma/client";

@ApiTags("Applications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: "Create new service application" })
  create(@GetUser("id") userId: string, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Fetch user applications (or all if staff/admin)" })
  findAll(@GetUser() user: any) {
    return this.applicationsService.findAllForUser(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get application details by ID" })
  findOne(@Param("id") id: string, @GetUser() user: any) {
    return this.applicationsService.findOne(id, user);
  }

  @Patch(":id/status")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
  @ApiOperation({ summary: "Admin: Update application status & remarks" })
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
    @GetUser() adminUser: any,
  ) {
    return this.applicationsService.updateStatus(id, dto, adminUser);
  }
}
