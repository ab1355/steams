import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationWithId = searchParams.get('userId');

  const messages = await prisma.message.findMany({
    where: conversationWithId ? {
      OR: [
        { AND: [{ senderId: session.user.id }, { receiverId: conversationWithId }] },
        { AND: [{ senderId: conversationWithId }, { receiverId: session.user.id }] }
      ]
    } : {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { content, receiverId } = body;

  if (!content || !receiverId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      receiverId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  // Emit the message through WebSocket
  global.io?.emit('newMessage', message);

  return NextResponse.json(message);
}
