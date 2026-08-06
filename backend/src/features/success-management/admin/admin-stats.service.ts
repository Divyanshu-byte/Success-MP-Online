import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { ApplicationStatus, RoleName } from "@prisma/client";

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count({
      where: { role: { name: RoleName.USER } },
    });

    const totalApplications = await this.prisma.application.count();

    const pendingCount = await this.prisma.application.count({
      where: {
        status: {
          in: [
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.DRAFT,
            ApplicationStatus.DOCUMENTS_PENDING,
            ApplicationStatus.PAYMENT_PENDING,
          ],
        },
      },
    });

    const processingCount = await this.prisma.application.count({
      where: {
        status: {
          in: [
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.DOCUMENT_VERIFICATION,
          ],
        },
      },
    });

    const completedCount = await this.prisma.application.count({
      where: {
        status: {
          in: [ApplicationStatus.COMPLETED, ApplicationStatus.APPROVED],
        },
      },
    });

    // Service-wise application breakdown
    const serviceGroups = await this.prisma.application.groupBy({
      by: ["serviceId"],
      _count: { id: true },
    });

    const services = await this.prisma.service.findMany();
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    const serviceWiseStats = serviceGroups.map((g) => {
      const s = serviceMap.get(g.serviceId);
      return {
        serviceId: g.serviceId,
        serviceCode: s?.code || "UNKNOWN",
        serviceName: s?.name || "Service",
        count: g._count.id,
      };
    });

    // Recently submitted applications
    const recentlySubmitted = await this.prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        service: true,
        user: { include: { profile: true } },
      },
    });

    // Recently completed applications
    const recentlyCompleted = await this.prisma.application.findMany({
      where: {
        status: {
          in: [ApplicationStatus.COMPLETED, ApplicationStatus.APPROVED],
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        service: true,
        user: { include: { profile: true } },
        documents: {
          where: { documentType: "DELIVERED_FINAL_DOCUMENT" },
        },
      },
    });

    // Financial revenue summary
    const revenueAgg = await this.prisma.application.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: "SUCCESS" },
    });

    return {
      totalUsers,
      totalApplications,
      pendingCount,
      processingCount,
      completedCount,
      totalRevenue: revenueAgg._sum.amount || 0,
      serviceWiseStats,
      recentlySubmitted,
      recentlyCompleted,
    };
  }
}
