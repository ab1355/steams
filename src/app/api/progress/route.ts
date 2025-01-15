import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { lessonId, timeSpent, score } = body;

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get the lesson to find its learning path
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      learningPath: {
        include: {
          lessons: true
        }
      }
    }
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Update or create lesson progress
  const lessonProgress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId
      }
    },
    update: {
      completed: true,
      timeSpent: timeSpent || 0,
      score: score || null
    },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      timeSpent: timeSpent || 0,
      score: score || null
    }
  });

  // Check if all lessons in the learning path are completed
  const allLessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: {
        in: lesson.learningPath.lessons.map(l => l.id)
      }
    }
  });

  const allLessonsCompleted = allLessonProgress.length === lesson.learningPath.lessons.length;

  if (allLessonsCompleted) {
    // Update learning path progress
    await prisma.learningPathProgress.upsert({
      where: {
        userId_learningPathId: {
          userId: session.user.id,
          learningPathId: lesson.learningPathId
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId: session.user.id,
        learningPathId: lesson.learningPathId,
        completed: true,
        completedAt: new Date()
      }
    });
  }

  return NextResponse.json(lessonProgress);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const learningPathId = searchParams.get('learningPathId');

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: learningPathId ? {
        learningPathId
      } : undefined
    },
    include: {
      lesson: true
    }
  });

  return NextResponse.json(progress);
}
