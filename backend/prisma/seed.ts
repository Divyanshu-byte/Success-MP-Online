import { PrismaClient, RoleName } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Roles
  const roles: { name: RoleName; description: string }[] = [
    { name: RoleName.SUPER_ADMIN, description: "Super Administrator with full access" },
    { name: RoleName.ADMIN, description: "Administrator for managing services and staff" },
    { name: RoleName.STAFF, description: "Staff reviewer for citizen applications" },
    { name: RoleName.OPERATOR, description: "Kiosk operator for application entry" },
    { name: RoleName.USER, description: "Citizen user portal access" },
  ];

  const createdRoles: Record<string, string> = {};

  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    createdRoles[role.name] = r.id;
  }

  // 2. Service Category & Services
  const cat = await prisma.serviceCategory.upsert({
    where: { name: "Government Citizen Services" },
    update: {},
    create: {
      name: "Government Citizen Services",
      description: "Official Madhya Pradesh Citizen Government Services",
    },
  });

  const servicesData = [
    {
      code: "pan_card",
      name: "PAN Card Application",
      tagline: "New PAN or Correction",
      description: "Apply for a new Permanent Account Number (PAN) or correct existing PAN details easily.",
      fee: 150,
      active: true,
      categoryId: cat.id,
      fields: [
        { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "As per Aadhaar" },
        { name: "fatherName", label: "Father's Name", type: "text", required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: true },
        { name: "aadhaarNo", label: "Aadhaar Number", type: "text", required: true, placeholder: "12-digit Aadhaar" },
      ],
      documents: [
        { name: "aadhaar_card", label: "Aadhaar Card", description: "Clear copy of Aadhaar card front & back", required: true },
        { name: "passport_photo", label: "Passport Size Photograph", description: "Recent passport photo", required: true },
        { name: "signature", label: "Applicant Signature", description: "Signature on white paper", required: true },
      ],
    },
    {
      code: "gumasta_license",
      name: "Gumasta License",
      tagline: "Shop & Establishment Registration",
      description: "Register your shop or commercial establishment under the MP Shops & Establishments Act.",
      fee: 599,
      active: true,
      categoryId: cat.id,
      fields: [
        { name: "enterpriseName", label: "Shop / Enterprise Name", type: "text", required: true },
        { name: "ownerName", label: "Owner Full Name", type: "text", required: true },
        { name: "category", label: "Business Category", type: "select", required: true, options: ["Retail Trade", "Wholesale Trade", "Restaurant / Hotel", "IT Services", "Manufacturing / Workshop", "Other Services"] },
        { name: "address", label: "Shop Address", type: "textarea", required: true, fullWidth: true },
        { name: "employeeCount", label: "Number of Employees", type: "text", required: true, placeholder: "e.g. 5" },
      ],
      documents: [
        { name: "owner_id", label: "Owner ID Proof (PAN / Aadhaar)", description: "Identity proof of shop owner", required: true },
        { name: "shop_address_proof", label: "Shop Address Proof", description: "Electricity bill / Rent agreement", required: true },
        { name: "photo_outer", label: "Shop Outer Board Photo", description: "Photo of shop showing name board", required: true },
      ],
    },
    {
      code: "msme_registration",
      name: "MSME / Udyam Registration",
      tagline: "Free MSME Certificate",
      description: "Register your micro, small or medium enterprise with MSME Govt. of India for subsidies & loans.",
      fee: 199,
      active: true,
      categoryId: cat.id,
      fields: [
        { name: "unitName", label: "Enterprise / Unit Name", type: "text", required: true },
        { name: "ownerName", label: "Owner / Managing Partner", type: "text", required: true },
        { name: "panNo", label: "PAN Number", type: "text", required: true, placeholder: "10-digit PAN" },
        { name: "bankAccount", label: "Bank Account Number", type: "text", required: true },
        { name: "ifscCode", label: "Bank IFSC Code", type: "text", required: true, placeholder: "e.g. SBIN0001234" },
      ],
      documents: [
        { name: "pan_card", label: "PAN Card", description: "Copy of PAN card", required: true },
        { name: "bank_passbook", label: "Bank Passbook / Cancelled Cheque", description: "Proof of bank account", required: true },
      ],
    },
  ];

  for (const svc of servicesData) {
    await prisma.service.upsert({
      where: { code: svc.code },
      update: svc,
      create: svc,
    });
  }

  // 3. First Admin Account
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@successmponline.in";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@123456";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      roleId: createdRoles[RoleName.ADMIN],
    },
    create: {
      email: adminEmail,
      phone: "9000000000",
      passwordHash,
      roleId: createdRoles[RoleName.ADMIN],
      profile: {
        create: {
          fullName: "System Admin",
          address: "Bhopal, Madhya Pradesh",
        },
      },
    },
  });

  // 4. Test User for Login
  const testUserEmail = "Divyanshuyadav1031@gmail.com";
  const testUserPassword = "Divyanshu@07";

  const testPasswordHash = await bcrypt.hash(testUserPassword, 10);

  const testUser = await prisma.user.upsert({
    where: { email: testUserEmail },
    update: {
      passwordHash: testPasswordHash,
      roleId: createdRoles[RoleName.USER],
    },
    create: {
      email: testUserEmail,
      phone: "9000000001",
      passwordHash: testPasswordHash,
      roleId: createdRoles[RoleName.USER],
      profile: {
        create: {
          fullName: "Divyanshu Yadav",
          address: "Madhya Pradesh",
        },
      },
    },
  });

  console.log(`Database seeded successfully! Admin user initialized: ${adminUser.email}`);
  console.log(`Test user initialized: ${testUser.email}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
