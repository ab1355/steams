import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const privateVapidKey = process.env.VAPID_PRIVATE_KEY as string;
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;

webpush.setVapidDetails(
  'mailto:support@steams-education.com',
  publicVapidKey,
  privateVapidKey
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, notification } = await req.json();

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    // Send push notification to all user's devices
    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          JSON.stringify(notification)
        );
      } catch (error: any) {
        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: {
              userId_endpoint: {
                userId,
                endpoint: subscription.endpoint,
              },
            },
          });
        }
        console.error('Error sending push notification:', error);
      }
    });

    await Promise.all(notificationPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
