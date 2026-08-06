import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AdminStatsService } from "./admin-stats.service";
import { AdminUsersService } from "./admin-users.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleName } from "@prisma/client";

@ApiTags("Success Management Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
@Controller("admin/success")
export class SuccessAdminController {
  constructor(
    private readonly adminStatsService: AdminStatsService,
    private readonly adminUsersService: AdminUsersService,
  ) {}

  @Get("stats")
  @ApiOperation({ summary: "Get executive admin dashboard metrics & service breakdown" })
  getStats() {
    return this.adminStatsService.getDashboardStats();
  }

  @Get("users")
  @ApiOperation({ summary: "Search & filter registered users list" })
  getUsers(@Query("search") search?: string) {
    return this.adminUsersService.getUsers(search);
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get detailed user profile, application history & completed documents" })
  getUserById(@Param("id") id: string) {
    return this.adminUsersService.getUserById(id);
  }
}
