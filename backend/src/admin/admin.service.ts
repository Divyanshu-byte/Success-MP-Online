import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationStatus } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalApplications = await this.prisma.application.count();
    const pendingCount = await this.prisma.application.count({
      where: { status: ApplicationStatus.SUBMITTED },
    });
    const approvedCount = await this.prisma.application.count({
      where: { status: ApplicationStatus.APPROVED },
    });
    const rejectedCount = await this.prisma.application.count({
      where: { status: ApplicationStatus.REJECTED },
    });

    const totalRevenueAgg = await this.prisma.application.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "SUCCESS" },
    });

    const totalUsers = await this.prisma.user.count();

    return {
      totalApplications,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalUsers,
      totalRevenue: totalRevenueAgg._sum.amount || 0,
    };
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { include: { profile: true } } },
    });
  }
}
