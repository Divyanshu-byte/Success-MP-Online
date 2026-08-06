import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(search?: string) {
    const where: any = {};
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { profile: { fullName: { contains: q, mode: "insensitive" } } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        role: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: 100,
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      fullName: u.profile?.fullName || u.email.split("@")[0],
      role: u.role.name,
      isActive: u.isActive,
      createdAt: u.createdAt,
      totalApplications: u._count.applications,
    }));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        role: true,
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            service: true,
            documents: true,
            statusHistory: {
              orderBy: { changedAt: "desc" },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found: ${id}`);
    }

    const completedApps = user.applications.filter(
      (a) => a.status === "COMPLETED" || a.status === "APPROVED",
    );

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.profile?.fullName,
      address: user.profile?.address,
      city: user.profile?.city,
      state: user.profile?.state,
      role: user.role.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      welcomeNotificationSentAt: user.welcomeNotificationSentAt,
      applications: user.applications,
      completedApplicationsCount: completedApps.length,
    };
  }
}
