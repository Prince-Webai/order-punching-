import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MOCK_USERS = [
  { name: 'John (Sales A)', email: 'john@solarcrm.test', role: 'SALESPERSON' },
  { name: 'Sarah (Sales B)', email: 'sarah@solarcrm.test', role: 'SALESPERSON' },
  { name: 'Mike (Manager)', email: 'mike@solarcrm.test', role: 'PROJECT_MANAGER' },
  { name: 'Admin User', email: 'admin@solarcrm.test', role: 'ADMIN' }
];

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
