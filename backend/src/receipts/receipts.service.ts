import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as PDFDocument from "pdfkit";

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

  async generatePdf(applicationId: string): Promise<Buffer> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        service: true,
        user: { include: { profile: true } },
      },
    });

    if (!app) {
      throw new NotFoundException(`Application not found: ${applicationId}`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header Band
      doc.rect(0, 0, 595, 90).fill("#0D47A1");
      doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold").text("Success MP Online", 40, 30);
      doc.fontSize(11).font("Helvetica").text("Government Services Portal — Payment Receipt", 40, 58);

      // Title
      doc.fillColor("#1F2937").fontSize(16).font("Helvetica-Bold").text("OFFICIAL RECEIPT", 40, 115, { align: "center" });

      // Meta Info
      let y = 150;
      const applicantName = app.user?.profile?.fullName || "Applicant";
      const email = app.user?.email || "";
      const phone = app.user?.phone || "-";

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#6B7280");
      doc.text("APPLICATION ID", 40, y);
      doc.text("DATE", 400, y);

      doc.fontSize(11).font("Helvetica").fillColor("#1F2937");
      doc.text(app.applicationNo, 40, y + 14);
      doc.text(new Date(app.createdAt).toLocaleString("en-IN"), 400, y + 14);

      y += 40;
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#6B7280");
      doc.text("SERVICE", 40, y);
      doc.text("STATUS", 400, y);

      doc.fontSize(11).font("Helvetica").fillColor("#1F2937");
      doc.text(app.service.name, 40, y + 14);
      doc.text(app.status.replace("_", " "), 400, y + 14);

      y += 40;
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#6B7280");
      doc.text("APPLICANT NAME", 40, y);
      doc.text("PAYMENT REF", 400, y);

      doc.fontSize(11).font("Helvetica").fillColor("#1F2937");
      doc.text(applicantName, 40, y + 14);
      doc.text(app.paymentId || "PAID_ONLINE", 400, y + 14);

      y += 40;
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#6B7280");
      doc.text("EMAIL", 40, y);
      doc.text("PHONE", 400, y);

      doc.fontSize(11).font("Helvetica").fillColor("#1F2937");
      doc.text(email, 40, y + 14);
      doc.text(phone, 400, y + 14);

      // Amount Box
      y += 50;
      doc.roundedRect(40, y, 515, 60, 6).fillAndStroke("#F0F7FF", "#0D47A1");
      doc.fillColor("#0D47A1").fontSize(11).font("Helvetica-Bold").text("AMOUNT PAID", 55, y + 15);
      doc.fontSize(20).text(`Rs. ${app.amount}/-`, 55, y + 30);
      doc.fontSize(9).font("Helvetica").text("Payment Verified Server-Side", 380, y + 35);

      // Footer
      doc.fontSize(8).fillColor("#9CA3AF").text("Computer-generated receipt. Does not require physical signature.", 40, 780, { align: "center" });
      doc.text("Success MP Online | support@successmponline.in", 40, 792, { align: "center" });

      doc.end();
    });
  }
}
