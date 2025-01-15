'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@prisma/client';
import InteractiveLessonContent from './InteractiveLessonContent';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: (lessonId: string, score?: number) => Promise<void>;
}

export default function LessonViewer({ lesson, onComplete }: LessonViewerProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleComplete = async (score?: number) => {
    setIsCompleting(true);
    try {
      await onComplete(lesson.id, score);
      setLastScore(score || null);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={lesson.content.videoUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        );
      case 'interactive':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <InteractiveLessonContent
              content={lesson.content}
              onComplete={(score) => handleComplete(score)}
            />
          </div>
        );
      case 'exercise':
        return (
          <div className="space-y-4">
            {lesson.content.questions.map((question: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-medium text-lg mb-2">{question.text}</h3>
                <div className="space-y-2">
                  {question.options.map((option: string, optionIndex: number) => (
                    <label key={optionIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return <div>Unsupported lesson type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Time Spent</div>
            <div className="text-2xl font-semibold">{formatTime(timeSpent)}</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-4">Duration: {lesson.duration} minutes</span>
          <span>Type: {lesson.type}</span>
          {lastScore !== null && (
            <span className="ml-4">Last Score: {lastScore}%</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {renderContent()}
      </div>

      {lesson.type !== 'interactive' && (
        <div className="flex justify-end">
          <button
            onClick={() => handleComplete()}
            disabled={isCompleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isCompleting ? 'Completing...' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
}
