import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ServicesService } from "./services.service";

@ApiTags("Services Catalog")
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: "Get public active services catalog" })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get service details by ID or code" })
  findOne(@Param("id") id: string) {
    return this.servicesService.findOne(id);
  }
}
