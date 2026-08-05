import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });
  }

  async findOne(idOrCode: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: { category: true },
    });

    if (!service) {
      throw new NotFoundException(`Service not found: ${idOrCode}`);
    }

    return service;
  }
}
