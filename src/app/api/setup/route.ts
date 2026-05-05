import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INITIAL_USERS = [
  { name: 'Admin', email: 'admin@tnsolarsolution.com', role: 'ADMIN', password: 'Prince@Gaur@786' },
  { name: 'Sales', email: 'sales@tnsolarsolution.com', role: 'SALESPERSON', password: 'Prince@Gaur@786' },
  { name: 'Manager', email: 'manager@tnsolarsolution.com', role: 'MANAGER', password: 'Prince@Gaur@786' },
];

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@tnsolarsolution.com' },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Already set up.' });
    }

    const created = [];
    for (const u of INITIAL_USERS) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      });
      created.push({ name: user.name, email: user.email, role: user.role });
    }

    return NextResponse.json({ success: true, created });
  } catch (error: any) {
    console.error('Setup error:', error.message || error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
