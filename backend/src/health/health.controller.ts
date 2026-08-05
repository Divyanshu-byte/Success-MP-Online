import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Check system health and database connection" })
  async checkHealth() {
    let dbStatus = "down";
    let dbDetails: Record<string, any> = {};

    try {
      // Verify basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = "up";

      // Verify tables exist and count seed data
      const roleCount = await this.prisma.role.count();
      const serviceCount = await this.prisma.service.count();
      const userCount = await this.prisma.user.count();

      dbDetails = {
        roles: roleCount,
        services: serviceCount,
        users: userCount,
        seeded: roleCount > 0 && serviceCount > 0,
      };
    } catch (err) {
      dbStatus = `error: ${err instanceof Error ? err.message : String(err)}`;
    }

    return {
      status: dbStatus === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      services: {
        api: "up",
        database: dbStatus,
        ...(dbStatus === "up" ? { databaseDetails: dbDetails } : {}),
      },
    };
  }
}
