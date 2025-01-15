'use client';

import { useState } from 'react';
import AnalyticsChart from './AnalyticsChart';
import { motion } from 'framer-motion';

interface AnalyticsData {
  timeSpentData: { date: string; value: number }[];
  completionRateData: { date: string; value: number }[];
  subjectDistribution: { subject: string; count: number }[];
  learningStyles: { style: string; percentage: number }[];
  difficultyLevels: { level: string; count: number }[];
  interactionMetrics: {
    avgTimePerLesson: number;
    avgAttemptsPerExercise: number;
    completionRate: number;
    accuracyRate: number;
  };
  progressTrends: {
    daily: { date: string; progress: number }[];
    weekly: { date: string; progress: number }[];
    monthly: { date: string; progress: number }[];
  };
}

interface DetailedAnalyticsProps {
  data: AnalyticsData;
}

export default function DetailedAnalytics({ data }: DetailedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'progress' | 'time' | 'completion'>('progress');

  const getChartData = () => {
    switch (selectedMetric) {
      case 'progress':
        return data.progressTrends[timeRange];
      case 'time':
        return data.timeSpentData;
      case 'completion':
        return data.completionRateData;
      default:
        return [];
    }
  };

  const metrics = [
    { key: 'progress', label: 'Learning Progress' },
    { key: 'time', label: 'Time Spent' },
    { key: 'completion', label: 'Completion Rate' },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Time per Lesson</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {Math.round(data.interactionMetrics.avgTimePerLesson)} min
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Average Attempts per Exercise</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {data.interactionMetrics.avgAttemptsPerExercise.toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {Math.round(data.interactionMetrics.completionRate)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Accuracy Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {Math.round(data.interactionMetrics.accuracyRate)}%
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Learning Analytics</h3>
            <div className="flex space-x-4">
              {metrics.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key as typeof selectedMetric)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedMetric === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {(['daily', 'weekly', 'monthly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-96">
          <AnalyticsChart
            data={getChartData()}
            label={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
            type="line"
          />
        </div>
      </div>

      {/* Learning Styles and Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Style Distribution</h3>
          <div className="space-y-4">
            {data.learningStyles.map(({ style, percentage }) => (
              <div key={style}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{style}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-indigo-600 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Level Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.difficultyLevels.map(({ level, count }) => (
              <div
                key={level}
                className="flex items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{level}</h4>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
                <div className="w-16 h-16">
                  {/* Add difficulty level icon here */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.subjectDistribution.map(({ subject, count }) => (
            <div
              key={subject}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-2xl font-semibold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500 mt-1">{subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => {/* Implement PDF export */}}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Export as PDF
        </button>
        <button
          onClick={() => {/* Implement CSV export */}}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Export as CSV
        </button>
      </div>
    </div>
  );
}
