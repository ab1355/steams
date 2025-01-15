'use client';

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isTouchDevice } from '@/utils/device';

interface DraggableItemProps {
  id: string;
  text: string;
  type: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

function DraggableItem({ id, text, type, index, moveItem }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: type,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 mb-2 rounded-lg cursor-move ${
        isDragging ? 'bg-gray-100 opacity-50' : 'bg-white'
      } border-2 border-gray-200 hover:border-indigo-500 transition-colors`}
      role="button"
      tabIndex={0}
      aria-label={`Draggable item: ${text}. Press space or enter to start dragging.`}
    >
      {text}
    </div>
  );
}

interface DragAndDropExerciseProps {
  items: { id: string; text: string }[];
  correctOrder: string[];
  onComplete: (score: number) => void;
}

export default function DragAndDropExercise({
  items,
  correctOrder,
  onComplete,
}: DragAndDropExerciseProps) {
  const [exerciseItems, setExerciseItems] = useState(items);
  const [isComplete, setIsComplete] = useState(false);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = exerciseItems[dragIndex];
    const newItems = [...exerciseItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setExerciseItems(newItems);
  };

  const handleCheck = () => {
    const currentOrder = exerciseItems.map((item) => item.id);
    const correctCount = currentOrder.reduce(
      (count, id, index) => (id === correctOrder[index] ? count + 1 : count),
      0
    );
    const score = Math.round((correctCount / correctOrder.length) * 100);
    setIsComplete(true);
    onComplete(score);
  };

  const handleKeyboardMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < exerciseItems.length - 1)
    ) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      moveItem(index, newIndex);
    }
  };

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Instructions</h3>
          <p className="text-gray-600">
            Drag and drop the items into the correct order. Use the keyboard (arrow keys,
            space, and enter) for accessibility.
          </p>
        </div>

        <div className="space-y-2" role="list" aria-label="Draggable items list">
          {exerciseItems.map((item, index) => (
            <div
              key={item.id}
              onKeyDown={(e) => {
                switch (e.key) {
                  case 'ArrowUp':
                    handleKeyboardMove(index, 'up');
                    break;
                  case 'ArrowDown':
                    handleKeyboardMove(index, 'down');
                    break;
                }
              }}
            >
              <DraggableItem
                id={item.id}
                text={item.text}
                type="exercise-item"
                index={index}
                moveItem={moveItem}
              />
            </div>
          ))}
        </div>

        {!isComplete && (
          <button
            onClick={handleCheck}
            className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Check Order
          </button>
        )}
      </div>
    </DndProvider>
  );
}
