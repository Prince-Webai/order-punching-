import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;
    const userRole = cookieStore.get('mock_user_role')?.value;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        salesperson: true,
        stageTrackings: {
          include: { updatedBy: true },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // RLS Enforcement
    if (userRole === 'SALESPERSON' && order.salespersonId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to this lead' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { stage } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        currentStage: stage,
        lastStageUpdatedAt: new Date(),
        stageTrackings: {
          create: {
            stage: stage,
            updatedById: userId || (await prisma.user.findFirst())?.id || ''
          }
        }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order stage' }, { status: 500 });
  }
}
