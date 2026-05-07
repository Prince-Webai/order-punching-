import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/audit';

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
        auditLogs: userRole === 'ADMIN', // ONLY ADMIN SEES AUDIT LOGS
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
    const { stage, loanStage, loanSubStage, rejectionReason } = await request.json();

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
    const userRole = cookieStore.get('mock_user_role')?.value;

    // 1. Perform the core update
    await prisma.order.update({
      where: { id },
      data: { 
        currentStage: stage || currentOrder.currentStage,
        loanStage: loanStage || currentOrder.loanStage,
        loanSubStage: loanSubStage || currentOrder.loanSubStage,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : currentOrder.rejectionReason,
        lastStageUpdatedAt: new Date(),
      }
    });

    // 2. Log the activity in the background (Audit Log)
    if (stage) {
      logActivity({
        orderId: id,
        userId,
        userRole,
        action: 'Stage Transition',
        details: `Moved from ${currentOrder.currentStage} to ${stage}`
      });
    }

    if (loanStage || loanSubStage) {
      logActivity({
        orderId: id,
        userId,
        userRole,
        action: 'Loan Milestone Update',
        details: `Set to ${loanStage || currentOrder.loanStage} (${loanSubStage || currentOrder.loanSubStage})`
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Order Update Fatal Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Database update failed'
    }, { status: 500 });
  }
}
