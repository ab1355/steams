'use client';

import { SUBJECTS, DIFFICULTY_LEVELS } from '@/config/constants';

interface FiltersProps {
  selectedSubjects: string[];
  selectedDifficulty: string | null;
  searchQuery: string;
  onSubjectChange: (subject: string) => void;
  onDifficultyChange: (difficulty: string | null) => void;
  onSearchChange: (query: string) => void;
}

export default function LearningPathFilters({
  selectedSubjects,
  selectedDifficulty,
  searchQuery,
  onSubjectChange,
  onDifficultyChange,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          type="text"
          id="search"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search learning paths..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(SUBJECTS).map((subject) => (
            <button
              key={subject}
              onClick={() => onSubjectChange(subject)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedSubjects.includes(subject)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(DIFFICULTY_LEVELS).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(selectedDifficulty === difficulty ? null : difficulty)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedDifficulty === difficulty
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
