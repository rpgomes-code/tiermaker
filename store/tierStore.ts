import { create } from 'zustand';
import { Column, Id, Card } from '@/app/types';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { DEFAULT_COLUMNS, MAX_HISTORY_LENGTH } from '@/constants';

// Define the history state structure
interface HistoryState {
    columns: Column[];
    cards: Card[];
    title: string;
}

interface TierState {
    // State
    columns: Column[];
    cards: Card[];
    activeColumn: Column | null;
    activeCard: Card | null;
    title: string;
    editMode: boolean;

    // History state
    past: HistoryState[];
    future: HistoryState[];

    // Undo/redo actions
    canUndo: () => boolean;
    canRedo: () => boolean;
    undo: () => void;
    redo: () => void;

    // Actions
    setTitle: (title: string) => void;
    toggleEditMode: () => void;
    setEditMode: (editMode: boolean) => void;
    setColumns: (columns: Column[]) => void;
    setCards: (cards: Card[]) => void;
    setActiveColumn: (column: Column | null) => void;
    setActiveCard: (card: Card | null) => void;

    // Column actions
    createColumn: () => void;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    updateColumnColor: (id: Id, color: string) => void;

    // Card actions
    createCard: (columnId: Id) => void;
    deleteCard: (id: Id) => void;
    updateCard: (id: Id, content: string) => void;

    // Drag and drop handlers
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver: (event: DragOverEvent) => void;

    // Save and load actions
    saveTierList: () => boolean;
    loadTierList: (id: string) => boolean;
    loadFromData: (data: { title: string; columns: Column[]; cards: Card[] }) => boolean;
}

const generateId = () => {
    return Math.floor(Math.random() * 10001);
};

// Helper to create a deep copy of state for history
const createStateSnapshot = (state: Pick<TierState, 'columns' | 'cards' | 'title'>): HistoryState => ({
    columns: JSON.parse(JSON.stringify(state.columns)),
    cards: JSON.parse(JSON.stringify(state.cards)),
    title: state.title
});

// Helper to add a state to the history with a size limit
const addToHistory = (past: HistoryState[], state: HistoryState): HistoryState[] => {
    const newPast = [...past, state];
    // Limit the size of the history to prevent memory issues
    if (newPast.length > MAX_HISTORY_LENGTH) {
        return newPast.slice(newPast.length - MAX_HISTORY_LENGTH);
    }
    return newPast;
};

export const useTierStore = create<TierState>((set, get) => ({
    // Initial state
    columns: DEFAULT_COLUMNS,
    cards: [],
    activeColumn: null,
    activeCard: null,
    title: "Tier Maker",
    editMode: false,

    // History state
    past: [],
    future: [],

    // Undo/redo methods
    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    undo: () => {
        const { past } = get();
        if (past.length === 0) return;

        const newPast = [...past];
        const previousState = newPast.pop();

        if (!previousState) return;

        const currentState = createStateSnapshot(get());

        set(state => ({
            past: newPast,
            columns: previousState.columns,
            cards: previousState.cards,
            title: previousState.title,
            future: [currentState, ...state.future].slice(0, MAX_HISTORY_LENGTH)
        }));
    },

    redo: () => {
        const { future } = get();
        if (future.length === 0) return;

        const [nextState, ...newFuture] = future;

        const currentState = createStateSnapshot(get());

        set(state => ({
            past: addToHistory(state.past, currentState),
            columns: nextState.columns,
            cards: nextState.cards,
            title: nextState.title,
            future: newFuture
        }));
    },

    // Actions
    setTitle: (title) => {
        // Store current state before making changes
        const currentState = createStateSnapshot(get());

        set(state => {
            // Only record if the title actually changed
            if (state.title !== title) {
                return {
                    title,
                    past: addToHistory(state.past, currentState),
                    future: []
                };
            }
            return { title };
        });
    },

    toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
    setEditMode: (editMode) => set({ editMode }),

    setColumns: (columns) => {
        const currentState = createStateSnapshot(get());
        set({
            columns,
            past: addToHistory(get().past, currentState),
            future: []
        });
    },

    setCards: (cards) => {
        const currentState = createStateSnapshot(get());
        set({
            cards,
            past: addToHistory(get().past, currentState),
            future: []
        });
    },

    setActiveColumn: (activeColumn) => set({ activeColumn }),
    setActiveCard: (activeCard) => set({ activeCard }),

    // Column actions
    createColumn: () => {
        const currentState = createStateSnapshot(get());

        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${get().columns.length + 1}`,
            color: "#09203f",
        };

        set((state) => ({
            columns: [...state.columns, columnToAdd],
            past: addToHistory(state.past, currentState),
            future: []
        }));
    },

    deleteColumn: (id) => {
        const currentState = createStateSnapshot(get());

        set((state) => ({
            columns: state.columns.filter((col) => col.id !== id),
            cards: state.cards.filter((card) => card.columnId !== id),
            past: addToHistory(state.past, currentState),
            future: []
        }));
    },

    updateColumn: (id, title) => {
        const currentState = createStateSnapshot(get());

        set((state) => {
            const newColumns = state.columns.map((col) => {
                if (col.id !== id) return col;
                return { ...col, title };
            });

            return {
                columns: newColumns,
                past: addToHistory(state.past, currentState),
                future: []
            };
        });
    },

    updateColumnColor: (id, color) => {
        const currentState = createStateSnapshot(get());

        set((state) => {
            const newColumns = state.columns.map((col) => {
                if (col.id !== id) return col;
                return { ...col, color };
            });

            return {
                columns: newColumns,
                past: addToHistory(state.past, currentState),
                future: []
            };
        });
    },

    // Card actions
    createCard: (columnId) => {
        const currentState = createStateSnapshot(get());

        const newCard: Card = {
            id: generateId(),
            columnId,
            content: `Card ${get().cards.length + 1}`
        };

        set((state) => ({
            cards: [...state.cards, newCard],
            past: addToHistory(state.past, currentState),
            future: []
        }));
    },

    deleteCard: (id) => {
        const currentState = createStateSnapshot(get());

        set((state) => ({
            cards: state.cards.filter((card) => card.id !== id),
            past: addToHistory(state.past, currentState),
            future: []
        }));
    },

    updateCard: (id, content) => {
        const currentState = createStateSnapshot(get());

        set((state) => {
            const newCards = state.cards.map((card) => {
                if (card.id !== id) return card;
                return { ...card, content };
            });

            return {
                cards: newCards,
                past: addToHistory(state.past, currentState),
                future: []
            };
        });
    },

    // Drag and drop handlers
    onDragStart: (event) => {
        if (event.active.data.current?.type === "Column") {
            set({ activeColumn: event.active.data.current.column });
            return;
        }
        if (event.active.data.current?.type === "Card") {
            set({ activeCard: event.active.data.current.card });
            return;
        }
    },

    onDragEnd: (event) => {
        const { active, over } = event;
        set({ activeColumn: null, activeCard: null });

        if (!over) return;
        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === "Column";
        if (!isActiveAColumn) return;

        const currentState = createStateSnapshot(get());

        set((state) => {
            const activeColumnIndex = state.columns.findIndex((col) => col.id === activeId);
            const overColumnIndex = state.columns.findIndex((col) => col.id === overId);

            // Only record history if the indexes are different
            if (activeColumnIndex !== overColumnIndex) {
                return {
                    columns: arrayMove(state.columns, activeColumnIndex, overColumnIndex),
                    past: addToHistory(state.past, currentState),
                    future: []
                };
            }

            return state;
        });
    },

    onDragOver: (event) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;
        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Card";
        const isOverATask = over.data.current?.type === "Card";

        if (!isActiveATask) return;

        const currentState = createStateSnapshot(get());

        if (isActiveATask && isOverATask) {
            set((state) => {
                const activeIndex = state.cards.findIndex((t) => t.id === activeId);
                const overIndex = state.cards.findIndex((t) => t.id === overId);

                // Only record history if there will be a change
                if (activeIndex !== overIndex) {
                    if (state.cards[activeIndex].columnId !== state.cards[overIndex].columnId) {
                        // Create a new array with the modified card
                        const newCards = [...state.cards];
                        newCards[activeIndex] = {
                            ...newCards[activeIndex],
                            columnId: newCards[overIndex].columnId
                        };

                        return {
                            cards: arrayMove(newCards, activeIndex, overIndex - 1),
                            past: addToHistory(state.past, currentState),
                            future: []
                        };
                    }

                    return {
                        cards: arrayMove(state.cards, activeIndex, overIndex),
                        past: addToHistory(state.past, currentState),
                        future: []
                    };
                }

                return state;
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveATask && isOverAColumn) {
            set((state) => {
                const activeIndex = state.cards.findIndex((t) => t.id === activeId);

                // Only record history if the column changes
                if (state.cards[activeIndex].columnId !== overId) {
                    const newCards = [...state.cards];
                    newCards[activeIndex] = {
                        ...newCards[activeIndex],
                        columnId: overId
                    };

                    return {
                        cards: newCards,
                        past: addToHistory(state.past, currentState),
                        future: []
                    };
                }

                return state;
            });
        }
    },

    // Save and load actions
    saveTierList: () => {
        const { title, columns, cards } = get();
        const tierData = {
            title,
            columns,
            cards,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem('tierMaker_' + title.replace(/\s+/g, '_'), JSON.stringify(tierData));
            return true;
        } catch (error) {
            console.error('Failed to save tier list:', error);
            return false;
        }
    },

    loadTierList: (id) => {
        try {
            const savedData = localStorage.getItem('tierMaker_' + id);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                set({
                    title: parsedData.title,
                    columns: parsedData.columns,
                    cards: parsedData.cards,
                    past: [], // Reset history when loading
                    future: []
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load tier list:', error);
            return false;
        }
    },

    loadFromData: (data) => {
        if (data && data.title && Array.isArray(data.columns) && Array.isArray(data.cards)) {
            set({
                title: data.title,
                columns: data.columns,
                cards: data.cards,
                past: [], // Reset history when loading external data
                future: []
            });
            return true;
        }
        return false;
    }
}));