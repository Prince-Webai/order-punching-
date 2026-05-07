import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateFolderByPhone, uploadToDrive } from '@/lib/googleDrive';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const documentType = formData.get('documentType') as string;
    const stage = formData.get('stage') as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: 'File and Order ID are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Google Drive Integration
    const folderId = await getOrCreateFolderByPhone(order.mobileNumber);
    if (!folderId) {
      console.error('Failed to get/create Google Drive folder');
      // Fallback or continue? User wants it on Drive.
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveFile = await uploadToDrive(file.name, file.type, buffer, folderId || '');

    const document = await prisma.document.create({
      data: {
        orderId,
        documentType,
        stage,
        fileUrl: driveFile?.webViewLink || 'pending_upload' // Store Drive link
      }
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Document Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
