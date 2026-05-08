import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && user.password === password) {
      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error.message || error);
    return NextResponse.json({ success: false, error: 'Authentication error' }, { status: 500 });
  }
}
