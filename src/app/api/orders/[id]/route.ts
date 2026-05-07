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
    const { stage, loanStage, loanSubStage } = await request.json();

    const STAGE_ORDER = ['ORDER', 'PAYMENT', 'MATERIAL_SHIPMENT', 'INSTALLATION', 'PROJECT_COMPLETION', 'EB_NET_METER'];

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Enforcement: Forward-only
    if (stage) {
      const currentIndex = STAGE_ORDER.indexOf(currentOrder.currentStage);
      const newIndex = STAGE_ORDER.indexOf(stage);
      
      if (newIndex < currentIndex) {
        return NextResponse.json({ error: 'Workflow is forward-only. Cannot move back.' }, { status: 403 });
      }
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;

    const updated = await prisma.order.update({
      where: { id },
      data: { 
        currentStage: stage || currentOrder.currentStage,
        loanStage: loanStage || currentOrder.loanStage,
        loanSubStage: loanSubStage || currentOrder.loanSubStage,
        lastStageUpdatedAt: new Date(),
        stageTrackings: (stage || loanStage) ? {
          create: {
            stage: stage || currentOrder.currentStage,
            subStage: loanSubStage ? `Loan Status: ${loanSubStage}` : undefined,
            updatedById: userId || (await prisma.user.findFirst())?.id || ''
          }
        } : undefined
      },
      include: {
        salesperson: true,
        payments: true,
        shipment: true,
        stageTrackings: { include: { updatedBy: true }, orderBy: { updatedAt: 'desc' } }
      }
    });

    return NextResponse.json({ success: true, order: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order stage' }, { status: 500 });
  }
}
