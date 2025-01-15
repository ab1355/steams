'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface TimedQuizProps {
  questions: Question[];
  timeLimit: number; // in seconds
  onComplete: (score: number, maxScore: number) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function TimedQuiz({
  questions,
  timeLimit,
  onComplete,
  difficulty = 'medium',
}: TimedQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [readAloud, setReadAloud] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const readText = (text: string) => {
    if (!readAloud) return;
    
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    speechSynthesisRef.current = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

  const handleAnswer = (answerIndex: number) => {
    if (isFinished || showExplanation) return;

    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    if (correct) {
      setScore((prev) => prev + questions[currentQuestion].points);
    }

    setShowExplanation(true);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        finishQuiz();
      }
    }, 2000);
  };

  const finishQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsFinished(true);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    onComplete(score, maxScore);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Accessibility Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => setHighContrastMode(!highContrastMode)}
            className="px-3 py-1 rounded-md bg-white shadow-sm"
            aria-label="Toggle high contrast mode"
          >
            {highContrastMode ? '👁️ High Contrast On' : '👁️ High Contrast Off'}
          </button>
          <button
            onClick={() => setReadAloud(!readAloud)}
            className="px-3 py-1 rounded-md bg-white shadow-sm"
            aria-label="Toggle read aloud"
          >
            {readAloud ? '🔊 Read Aloud On' : '🔇 Read Aloud Off'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
              className="px-2 rounded-md bg-white shadow-sm"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
              className="px-2 rounded-md bg-white shadow-sm"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Timer and Progress */}
      <div className="relative pt-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold">Time Remaining: {formatTime(timeRemaining)}</span>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <motion.div
            className={`${getProgressColor()} transition-all duration-1000`}
            style={{ width: `${(timeRemaining / timeLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        className={`p-6 rounded-lg ${
          highContrastMode
            ? 'bg-black text-white border-2 border-white'
            : 'bg-white shadow-sm'
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          onFocus={() => readText(questions[currentQuestion].question)}
        >
          {questions[currentQuestion].question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation || isFinished}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                showExplanation
                  ? index === questions[currentQuestion].correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : index === selectedAnswer
                    ? 'bg-red-100 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                  : highContrastMode
                  ? 'bg-gray-800 hover:bg-gray-700 border-white'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } border-2`}
              onFocus={() => readText(option)}
              aria-label={`Option ${index + 1}: ${option}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200"
            >
              <p className="text-blue-800">{questions[currentQuestion].explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Summary */}
      {isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-white rounded-lg shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-4">Quiz Complete!</h3>
          <p className="text-lg mb-2">
            Final Score: {score} / {questions.reduce((sum, q) => sum + q.points, 0)}
          </p>
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className={`p-4 rounded-lg ${
                  answers[index] === q.correctAnswer
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                } border`}
              >
                <p className="font-medium">{q.question}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your answer: {answers[index] !== null ? q.options[answers[index]] : 'Not answered'}
                </p>
                <p className="text-sm text-gray-600">
                  Correct answer: {q.options[q.correctAnswer]}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
