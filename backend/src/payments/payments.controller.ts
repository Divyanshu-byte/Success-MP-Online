import { Controller, Get, Post, Body, UseGuards, Headers } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create-order")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create Razorpay Order for application" })
  createOrder(
    @Body("applicationId") applicationId: string,
    @GetUser("id") userId: string,
  ) {
    return this.paymentsService.createOrder(applicationId, userId);
  }

  @Post("verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify Razorpay payment signature" })
  verifyPayment(
    @Body("orderId") orderId: string,
    @Body("paymentId") paymentId: string,
    @Body("signature") signature: string,
    @Body("applicationId") applicationId: string,
  ) {
    return this.paymentsService.verifyPayment(orderId, paymentId, signature, applicationId);
  }

  @Post("webhook")
  @ApiOperation({ summary: "Razorpay Server Webhook Listener" })
  handleWebhook(
    @Body() payload: any,
    @Headers("x-razorpay-signature") signature: string,
  ) {
    return this.paymentsService.handleWebhook(payload, signature);
  }
}
