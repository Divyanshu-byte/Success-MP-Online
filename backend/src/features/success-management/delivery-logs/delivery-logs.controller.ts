import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DeliveryLogsService } from "./delivery-logs.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleName } from "@prisma/client";

@ApiTags("Delivery Logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
@Controller("admin/delivery-logs")
export class DeliveryLogsController {
  constructor(private readonly deliveryLogsService: DeliveryLogsService) {}

  @Get()
  @ApiOperation({ summary: "Admin: View notification and email delivery log history" })
  getDeliveryLogs() {
    return this.deliveryLogsService.getDeliveryLogs();
  }
}
