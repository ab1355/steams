'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'framer-motion';

interface Item {
  id: string;
  content: string;
  correctPosition: number;
}

interface SortingExerciseProps {
  items: { content: string }[];
  onComplete: (score: number) => void;
  description: string;
}

interface DraggableItemProps {
  item: Item;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  isDraggingEnabled: boolean;
}

function DraggableItem({ item, index, moveItem, isDraggingEnabled }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isDraggingEnabled,
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      initial={{ scale: 1 }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`p-4 bg-white rounded-lg shadow-sm border-2 ${
        isDragging ? 'border-indigo-500' : 'border-gray-200'
      } cursor-move mb-2`}
      role="listitem"
      aria-grabbed={isDragging}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-900">{item.content}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => moveItem(index, Math.max(0, index - 1))}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Move up"
            disabled={!isDraggingEnabled || index === 0}
          >
            ↑
          </button>
          <button
            onClick={() => moveItem(index, index + 1)}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Move down"
            disabled={!isDraggingEnabled}
          >
            ↓
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SortingExercise({
  items: initialItems,
  onComplete,
  description,
}: SortingExerciseProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
    
    // Initialize items with correct positions
    const sortedItems = initialItems.map((item, index) => ({
      id: `${index}`,
      content: item.content,
      correctPosition: index,
    }));
    
    // Shuffle the items
    setItems(shuffleArray([...sortedItems]));
  }, [initialItems]);

  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex];
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (isChecking) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveItem(index, Math.max(0, index - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveItem(index, Math.min(items.length - 1, index + 1));
        break;
    }
  };

  const checkOrder = () => {
    setIsChecking(true);
    setAttempts(attempts + 1);

    const isCorrect = items.every((item, index) => item.correctPosition === index);
    
    if (isCorrect) {
      const score = calculateScore(attempts);
      setFeedback(`Congratulations! You've sorted the items correctly in ${attempts + 1} attempts.`);
      onComplete(score);
    } else {
      setFeedback('Not quite right. Try again!');
      setTimeout(() => {
        setIsChecking(false);
        setFeedback('');
      }, 2000);
    }
  };

  const calculateScore = (attempts: number) => {
    return Math.max(0, 100 - (attempts - 1) * 20);
  };

  const reset = () => {
    setItems(shuffleArray([...items]));
    setIsChecking(false);
    setFeedback('');
  };

  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Sorting Exercise</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        <div
          className="space-y-2"
          role="list"
          aria-label="Sortable items"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <DraggableItem
                item={item}
                index={index}
                moveItem={moveItem}
                isDraggingEnabled={!isChecking}
              />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg ${
                feedback.includes('Congratulations')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-4">
          <button
            onClick={checkOrder}
            disabled={isChecking}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Check Order
          </button>
          <button
            onClick={reset}
            disabled={isChecking}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Instructions</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Drag and drop items to reorder them</li>
            <li>Use the arrow buttons or keyboard arrows to move items</li>
            <li>Click "Check Order" to verify your solution</li>
            <li>Try to complete the exercise in as few attempts as possible</li>
          </ul>
        </div>
      </div>
    </DndProvider>
  );
}
