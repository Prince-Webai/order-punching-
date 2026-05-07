import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      salespersonId, 
      clientName, 
      mobileNumber, 
      emailId, 
      systemSizeKw, 
      quotationAmount, 
      paymentType, 
      loanType, 
      paymentAmountCollected 
    } = body;

    // Server-side strict validation
    if (paymentType === 'FULL_PAYMENT' && Number(paymentAmountCollected) < 5000) {
      return NextResponse.json({ error: 'Minimum ₹5000 required for Full Payment' }, { status: 400 });
    }

    // As per user request, all newly created orders should start in the ORDER stage.
    const initialStage = 'ORDER';

    // To prevent immediate crash if DB is not connected/migrated or Salesperson doesn't exist, 
    // we would ideally wrap this. But for now, we assume schema is migrated.
    
    // Read active user from mock cookies
    const cookieStore = await cookies();
    const activeUserId = cookieStore.get('mock_user_id')?.value;

    let targetSalespersonId = activeUserId || salespersonId;

    if (!targetSalespersonId) {
      let dummyUser = await prisma.user.findFirst();
      if (!dummyUser) {
        dummyUser = await prisma.user.create({
          data: { name: "Test Salesperson", email: "test@example.com", role: "SALESPERSON" }
        });
      }
      targetSalespersonId = dummyUser.id;
    }

    const newOrder = await prisma.order.create({
      data: {
        salespersonId: targetSalespersonId,
        clientName,
        mobileNumber,
        emailId,
        systemSizeKw: Number(systemSizeKw),
        quotationAmount: Number(quotationAmount),
        paymentType: paymentType || null,
        loanType: loanType || null,
        paymentAmountCollected: Number(paymentAmountCollected) || 0,
        currentStage: initialStage,
        loanStage: 'PRE_SALES',
        loanSubStage: 'Waiting for customer response',
        stageTrackings: {
          create: {
            stage: initialStage,
            subStage: 'Waiting for customer response',
            updatedById: targetSalespersonId
          }
        }
      }
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Order Punching Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please ensure the database is connected.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('mock_user_id')?.value;
    const userRole = cookieStore.get('mock_user_role')?.value;

    let whereClause = {};
    // RLS Enforcement: Salespersons only see their own leads. Managers/Admins see all.
    if (userRole === 'SALESPERSON' && userId) {
      whereClause = { salespersonId: userId };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
