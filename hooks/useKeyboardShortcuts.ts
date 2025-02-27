import { useEffect } from 'react';

interface KeyboardShortcutOptions {
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    disabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts for undo/redo operations
 */
export function useKeyboardShortcuts({
                                         onUndo,
                                         onRedo,
                                         canUndo = true,
                                         canRedo = true,
                                         disabled = false
                                     }: KeyboardShortcutOptions) {
    useEffect(() => {
        if (disabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+Z or Command+Z (Undo)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                if (canUndo && onUndo) {
                    e.preventDefault();
                    onUndo();
                }
            }

            // Check for Ctrl+Y (Redo on Windows) or Ctrl+Shift+Z / Command+Shift+Z (Redo on Mac)
            if (
                ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
            ) {
                if (canRedo && onRedo) {
                    e.preventDefault();
                    onRedo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onUndo, onRedo, canUndo, canRedo, disabled]);
}