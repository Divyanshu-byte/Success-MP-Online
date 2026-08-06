import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { DocumentDeliveryService } from "./document-delivery.service";
import { DeliverDocumentDto } from "./dto/deliver-document.dto";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { GetUser } from "../../../common/decorators/get-user.decorator";
import { RoleName } from "@prisma/client";

@ApiTags("Document Delivery")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF)
@Controller("applications")
export class DocumentDeliveryController {
  constructor(private readonly documentDeliveryService: DocumentDeliveryService) {}

  @Post(":id/deliver")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Admin: 1-Click Document Delivery & Automated Notification Workflow" })
  @UseInterceptors(FileInterceptor("file"))
  deliverDocument(
    @Param("id") applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: DeliverDocumentDto,
    @GetUser() adminUser: any,
  ) {
    if (!file) {
      throw new BadRequestException("Please attach a valid PDF document to deliver.");
    }
    return this.documentDeliveryService.deliverDocument(
      applicationId,
      file,
      adminUser,
      dto.overwrite,
    );
  }
}
