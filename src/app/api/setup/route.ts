import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Create all tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL DEFAULT 'Prince@Gaur@786',
        "role" TEXT NOT NULL DEFAULT 'SALESPERSON',
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "salespersonId" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "mobileNumber" TEXT NOT NULL,
        "emailId" TEXT NOT NULL,
        "systemSizeKw" DOUBLE PRECISION NOT NULL,
        "quotationAmount" DOUBLE PRECISION NOT NULL,
        "currentStage" TEXT NOT NULL DEFAULT 'ORDER',
        "paymentType" TEXT,
        "loanType" TEXT,
        "paymentAmountCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastStageUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL,
        "documentType" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StageTracking" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL,
        "stage" TEXT NOT NULL,
        "subStage" TEXT,
        "updatedById" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StageTracking_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Installation" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL,
        "installationDate" TIMESTAMP(3),
        "teamAssigned" TEXT,
        CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
      );
    `);

    // Seed initial users
    const users = [
      { name: 'Admin', email: 'admin@tnsolarsolution.com', role: 'ADMIN', password: 'Prince@Gaur@786' },
      { name: 'Sales', email: 'sales@tnsolarsolution.com', role: 'SALESPERSON', password: 'Prince@Gaur@786' },
      { name: 'Manager', email: 'manager@tnsolarsolution.com', role: 'MANAGER', password: 'Prince@Gaur@786' },
    ];

    const created = [];
    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        const user = await prisma.user.create({ data: u });
        created.push({ name: user.name, email: user.email, role: user.role });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created and users seeded.',
      created: created.length > 0 ? created : 'Users already exist.',
    });
  } catch (error: any) {
    console.error('Setup error:', error.message || error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
