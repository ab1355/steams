'use client';

import { useState, useEffect } from 'react';

interface InteractiveLessonContentProps {
  content: {
    type: 'quiz' | 'matching' | 'interactive';
    data: any;
  };
  onComplete: (score: number) => void;
}

export default function InteractiveLessonContent({
  content,
  onComplete,
}: InteractiveLessonContentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep]: answer,
    }));
  };

  const checkAnswers = () => {
    let correct = 0;
    const total = content.data.questions.length;

    content.data.questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / total) * 100);
    setScore(finalScore);
    setFeedback(
      finalScore >= 70
        ? 'Great job! You\'ve mastered this lesson!'
        : 'Keep practicing! Try reviewing the material and attempt the quiz again.'
    );
    onComplete(finalScore);
  };

  const renderQuestion = () => {
    const question = content.data.questions[currentStep];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.text}</h3>
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentStep] === option
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentStep}`}
                      value={option}
                      checked={answers[currentStep] === option}
                      onChange={() => handleAnswer(option)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3">{option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{question.text}</h3>
            <div className="grid grid-cols-2 gap-4">
              {question.pairs.map((pair: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded">{pair.left}</div>
                  <select
                    value={answers[currentStep]?.[index] || ''}
                    onChange={(e) => {
                      const newAnswers = { ...answers[currentStep] };
                      newAnswers[index] = e.target.value;
                      handleAnswer(newAnswers);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select match</option>
                    {question.pairs.map((p: any, i: number) => (
                      <option key={i} value={p.right}>
                        {p.right}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {score === null ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              Question {currentStep + 1} of {content.data.questions.length}
            </div>
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {currentStep < content.data.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!answers[currentStep]}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={checkAnswers}
                  disabled={!answers[currentStep]}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
          {renderQuestion()}
        </>
      ) : (
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">{score}%</div>
          <p className="text-lg text-gray-600 mb-6">{feedback}</p>
          <button
            onClick={() => {
              setScore(null);
              setAnswers({});
              setCurrentStep(0);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
