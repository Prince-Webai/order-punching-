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
    const users = [];
    
    for (const userData of MOCK_USERS) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
      users.push(user);
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to initialize mock users' }, { status: 500 });
  }
}
