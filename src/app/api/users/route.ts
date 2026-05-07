import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, password } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: password || 'Prince@Gaur@786'
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
