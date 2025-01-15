'use client';

import { LearningPath, LearningPathProgress, LessonProgress } from '@prisma/client';
import AnalyticsChart from './AnalyticsChart';
import { useState } from 'react';

interface ProgressDashboardProps {
  learningPaths: (LearningPath & {
    progress: LearningPathProgress[];
    lessons: {
      id: string;
      title: string;
      progress: LessonProgress[];
    }[];
  })[];
  timeSpentData: { date: string; value: number }[];
  completionRateData: { date: string; value: number }[];
  subjectDistribution: { subject: string; count: number }[];
}

export default function ProgressDashboard({
  learningPaths,
  timeSpentData,
  completionRateData,
  subjectDistribution,
}: ProgressDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const totalPaths = learningPaths.length;
  const completedPaths = learningPaths.filter(
    path => path.progress[0]?.completed
  ).length;

  const totalLessons = learningPaths.reduce(
    (acc, path) => acc + path.lessons.length,
    0
  );
  const completedLessons = learningPaths.reduce(
    (acc, path) =>
      acc +
      path.lessons.filter(lesson => lesson.progress[0]?.completed).length,
    0
  );

  const averageScore = learningPaths.reduce((acc, path) => {
    const pathScores = path.lessons
      .map(lesson => lesson.progress[0]?.score)
      .filter((score): score is number => score !== undefined);
    return pathScores.length ? acc + (pathScores.reduce((a, b) => a + b, 0) / pathScores.length) : acc;
  }, 0) / (totalPaths || 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Learning Paths
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {completedPaths}/{totalPaths}
                    </div>
                    <div className="ml-2 text-sm text-gray-600">
                      ({Math.round((completedPaths / totalPaths) * 100)}% complete)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Lessons
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {completedLessons}/{totalLessons}
                    </div>
                    <div className="ml-2 text-sm text-gray-600">
                      ({Math.round((completedLessons / totalLessons) * 100)}% complete)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Score
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {Math.round(averageScore)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Learning Analytics</h3>
            <div className="flex space-x-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedTimeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">Time Spent Learning</h4>
              <AnalyticsChart
                data={timeSpentData}
                label="Hours"
                type="line"
                color="#4F46E5"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">Completion Rate</h4>
              <AnalyticsChart
                data={completionRateData}
                label="Completion %"
                type="line"
                color="#10B981"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {subjectDistribution.map(({ subject, count }) => (
              <div key={subject} className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">{subject}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Learning Path Progress
          </h3>
          <div className="space-y-4">
            {learningPaths.map((path) => {
              const completedLessonsCount = path.lessons.filter(
                lesson => lesson.progress[0]?.completed
              ).length;
              const progressPercentage =
                (completedLessonsCount / path.lessons.length) * 100;

              return (
                <div key={path.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {path.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {completedLessonsCount}/{path.lessons.length} lessons
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${progressPercentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
