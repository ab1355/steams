import { LearningPath } from '@prisma/client';
import Link from 'next/link';

interface LearningPathCardProps {
  path: LearningPath;
  progress?: number;
}

export default function LearningPathCard({ path, progress }: LearningPathCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            {path.difficulty}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600">{path.description}</p>
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {path.subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href={`/learning-paths/${path.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
