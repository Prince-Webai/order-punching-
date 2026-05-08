import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderIds, items, batchName } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Create BOM Batch
    const bom = await prisma.bOM.create({
      data: {
        batchName: batchName || "Consolidated Shipment",
        totalCost,
        items: {
          create: items.map(item => ({
            productName: item.productName,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice)
          }))
        },
        allocations: {
          create: orderIds.map(orderId => ({
            orderId: orderId
          }))
        }
      },
      include: { items: true, allocations: true }
    });

    return NextResponse.json({ success: true, bom });
  } catch (error: any) {
    console.error('BOM creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const boms = await prisma.bOM.findMany({
      include: { 
        items: true,
        allocations: {
          include: {
            order: {
              select: { clientName: true, id: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, boms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
