import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { amount, paymentMode, referenceNumber, paymentDate, proofUrl } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;

    const payment = await prisma.payment.create({
      data: {
        orderId: id,
        amount: parseFloat(amount),
        paymentMode,
        referenceNumber,
        paymentDate: new Date(paymentDate),
        proofUrl
      }
    });

    // Update total paid amount and potentially move stage
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    
    await prisma.order.update({
      where: { id },
      data: {
        totalPaidAmount: { increment: parseFloat(amount) },
        currentStage: (currentOrder?.currentStage === 'ORDER') ? 'PAYMENT' : currentOrder?.currentStage,
        lastStageUpdatedAt: new Date(),
        stageTrackings: {
          create: {
            stage: 'PAYMENT',
            subStage: `Payment Added: ₹${amount}`,
            updatedById: userId || (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || ''
          }
        }
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { 
        payments: true,
        shipment: true,
        stageTrackings: { include: { updatedBy: true }, orderBy: { updatedAt: 'desc' } }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json({ success: false, error: 'Failed to add payment' }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payments = await prisma.payment.findMany({
      where: { orderId: id },
      orderBy: { paymentDate: 'desc' }
    });
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { 
        payments: true,
        shipment: true,
        stageTrackings: { include: { updatedBy: true }, orderBy: { updatedAt: 'desc' } }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 });
  }
}
