import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { ApplicationStatus } from "@prisma/client";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF"];

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const service = await this.prisma.service.findFirst({
      where: {
        OR: [{ id: dto.serviceType }, { code: dto.serviceType }],
      },
    });

    if (!service) {
      throw new BadRequestException(`Invalid service type: ${dto.serviceType}`);
    }

    const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const applicationNo = `SUC-${shortId}`;

    const app = await this.prisma.application.create({
      data: {
        applicationNo,
        userId,
        serviceId: service.id,
        formData: dto.formData,
        amount: service.fee,
        status: ApplicationStatus.SUBMITTED,
        statusHistory: {
          create: {
            oldStatus: undefined,
            newStatus: ApplicationStatus.SUBMITTED,
            changedById: userId,
            remarks: "Application submitted",
          },
        },
      },
      include: {
        service: true,
        user: { include: { profile: true } },
      },
    });

    // Automatically send confirmation email to registered user
    const recipientEmail =
      app.user?.email ||
      (dto.formData as any)?.applicant_email ||
      (dto.formData as any)?.email ||
      "";

    const applicantName =
      app.user?.profile?.fullName ||
      (dto.formData as any)?.applicant_name ||
      (dto.formData as any)?.fullName ||
      "Applicant";

    let emailSent = false;
    let emailMessage: string | undefined;

    if (recipientEmail) {
      const emailResult = await this.mailService.sendApplicationConfirmationEmail({
        to: recipientEmail,
        applicantName,
        applicationNo: app.applicationNo,
        serviceName: service.name,
        createdAt: app.createdAt,
        status: app.status,
      });

      emailSent = emailResult.success;
      emailMessage = emailResult.error;
    } else {
      this.logger.warn(`No recipient email found for user ${userId} on application ${app.id}`);
      emailMessage = "No recipient email address associated with account.";
    }

    return {
      ...app,
      emailSent,
      emailMessage,
    };
  }

  async findAllForUser(user: any) {
    const userRole: string = user.role?.name || user.role || "";
    const isAdmin = STAFF_ROLES.includes(userRole);

    return this.prisma.application.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        service: true,
        user: { include: { profile: true } },
        documents: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, user: any) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        service: true,
        user: { include: { profile: true } },
        documents: true,
        payments: true,
        statusHistory: {
          orderBy: { changedAt: "desc" },
          include: { changedBy: { include: { profile: true } } },
        },
      },
    });

    if (!app) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    const userRole: string = user.role?.name || user.role || "";
    const isAdmin = STAFF_ROLES.includes(userRole);
    if (!isAdmin && app.userId !== user.id) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    return app;
  }

  async updateStatus(id: string, dto: UpdateStatusDto, adminUser: any) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) {
      throw new NotFoundException(`Application not found: ${id}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.application.update({
        where: { id },
        data: {
          status: dto.status,
          adminNotes: dto.adminNotes !== undefined ? dto.adminNotes : app.adminNotes,
        },
        include: {
          service: true,
          user: { include: { profile: true } },
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          oldStatus: app.status,
          newStatus: dto.status,
          changedById: adminUser.id,
          remarks: dto.adminNotes || `Status updated to ${dto.status}`,
        },
      });

      return result;
    });

    return updated;
  }
}
