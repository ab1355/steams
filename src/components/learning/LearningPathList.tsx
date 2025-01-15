'use client';

import { useState } from 'react';
import LearningPathCard from './LearningPathCard';
import LearningPathFilters from './LearningPathFilters';
import { LearningPath } from '@prisma/client';

interface LearningPathListProps {
  initialPaths: (LearningPath & {
    progress: { completed: boolean }[];
  })[];
}

export default function LearningPathList({ initialPaths }: LearningPathListProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPaths = initialPaths.filter((path) => {
    // Search filter
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Subject filter
    const matchesSubjects = selectedSubjects.length === 0 ||
      path.subjects.some(subject => selectedSubjects.includes(subject));

    // Difficulty filter
    const matchesDifficulty = !selectedDifficulty ||
      path.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubjects && matchesDifficulty;
  });

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div>
      <LearningPathFilters
        selectedSubjects={selectedSubjects}
        selectedDifficulty={selectedDifficulty}
        searchQuery={searchQuery}
        onSubjectChange={handleSubjectChange}
        onDifficultyChange={setSelectedDifficulty}
        onSearchChange={setSearchQuery}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPaths.map((path) => (
          <LearningPathCard
            key={path.id}
            path={path}
            progress={
              path.progress[0]?.completed
                ? 100
                : path.progress[0]
                ? 50
                : 0
            }
          />
        ))}
      </div>
    </div>
  );
}
