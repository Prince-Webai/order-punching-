import { prisma } from './prisma';

export async function logActivity({ 
  orderId, 
  userId, 
  userName, 
  userRole, 
  action, 
  details 
}: {
  orderId: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  details?: string;
}) {
  try {
    // If we don't have user info (rare), try to find the user in the DB
    let finalName = userName;
    let finalRole = userRole;

    if (!finalName && userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        finalName = user.name;
        finalRole = user.role;
      }
    }

    await prisma.auditLog.create({
      data: {
        orderId,
        userId,
        userName: finalName || 'System',
        userRole: finalRole || 'SYSTEM',
        action,
        details,
      }
    });
  } catch (error) {
    console.error('FAILED TO LOG AUDIT:', error);
    // We don't throw error to prevent crashing the main app flow
  }
}
