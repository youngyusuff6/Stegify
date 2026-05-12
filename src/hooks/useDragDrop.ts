import { useState, useRef, useCallback, type DragEvent } from 'react';

interface UseDragDropOptions {
  onDrop: (files: FileList) => void;
  accept?: string[];
}

export function useDragDrop({ onDrop, accept }: UseDragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (accept) {
        const file = files[0];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const mime = file.type;
        const valid = accept.some(a => mime.startsWith(a.replace('/*', '/')) || a === ext || a === mime);
        if (!valid) return;
      }
      onDrop(files);
    }
  }, [onDrop, accept]);

  return { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop };
}
