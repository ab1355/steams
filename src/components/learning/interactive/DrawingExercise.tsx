'use client';

import { useRef, useState, useEffect } from 'react';

interface DrawingExerciseProps {
  prompt: string;
  onSave: (imageData: string) => void;
}

export default function DrawingExercise({ prompt, onSave }: DrawingExerciseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
        // Save initial blank canvas
        saveToUndoStack();
      }
    }
  }, []);

  const saveToUndoStack = () => {
    if (context && canvasRef.current) {
      const imageData = context.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setUndoStack((prev) => [...prev, imageData]);
      setRedoStack([]);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    if (context) {
      context.beginPath();
      const { x, y } = getCoordinates(e);
      context.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (context) {
        context.closePath();
        saveToUndoStack();
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const undo = () => {
    if (undoStack.length > 1 && context && canvasRef.current) {
      const currentState = undoStack[undoStack.length - 1];
      const previousState = undoStack[undoStack.length - 2];
      
      setRedoStack((prev) => [...prev, currentState]);
      setUndoStack((prev) => prev.slice(0, -1));
      
      context.putImageData(previousState, 0, 0);
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && context && canvasRef.current) {
      const nextState = redoStack[redoStack.length - 1];
      
      setUndoStack((prev) => [...prev, nextState]);
      setRedoStack((prev) => prev.slice(0, -1));
      
      context.putImageData(nextState, 0, 0);
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToUndoStack();
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/png');
      onSave(imageData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Drawing Exercise</h3>
        <p className="text-gray-600">{prompt}</p>
      </div>

      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 border-0 rounded"
          />
        </div>
        <div>
          <label htmlFor="brushSize" className="block text-sm font-medium text-gray-700">
            Brush Size
          </label>
          <input
            type="range"
            id="brushSize"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full touch-none bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          role="img"
          aria-label="Drawing canvas"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={undo}
          disabled={undoStack.length <= 1}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          aria-label="Undo last drawing action"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          aria-label="Redo last undone drawing action"
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          aria-label="Clear canvas"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          aria-label="Save drawing"
        >
          Save
        </button>
      </div>
    </div>
  );
}
