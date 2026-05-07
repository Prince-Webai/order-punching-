import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { productDetails, vehicleNumber, driverName, sentDate, dispatchProofUrl } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;

    const shipment = await prisma.shipment.upsert({
      where: { orderId: id },
      update: {
        productDetails,
        vehicleNumber,
        driverName,
        sentDate: new Date(sentDate),
        dispatchProofUrl
      },
      create: {
        orderId: id,
        productDetails,
        vehicleNumber,
        driverName,
        sentDate: new Date(sentDate),
        dispatchProofUrl
      }
    });

    await prisma.order.update({
      where: { id },
      data: {
        currentStage: 'MATERIAL_SHIPMENT',
        lastStageUpdatedAt: new Date(),
        stageTrackings: {
          create: {
            stage: 'MATERIAL_SHIPMENT',
            subStage: `Material Dispatched: ${vehicleNumber}`,
            updatedById: userId || ''
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
    console.error('Error adding shipment:', error);
    return NextResponse.json({ success: false, error: 'Failed to add shipment' }, { status: 500 });
  }
}
