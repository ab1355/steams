import { prisma } from '@/lib/prisma';
import LearningPathList from '@/components/learning/LearningPathList';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function LearningPathsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const learningPaths = await prisma.learningPath.findMany({
    include: {
      progress: {
        where: {
          userId: session.user.id
        }
      }
    }
  });

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Learning Paths
          </h2>
        </div>
      </div>

      <LearningPathList initialPaths={learningPaths} />
    </div>
  );
}
