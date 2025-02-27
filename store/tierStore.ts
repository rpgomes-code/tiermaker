import { create } from 'zustand';
import { Column, Id, Card } from '@/app/types';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';

interface TierState {
    // State
    columns: Column[];
    cards: Card[];
    activeColumn: Column | null;
    activeCard: Card | null;
    title: string;
    editMode: boolean;

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
}

const defaultCols: Column[] = [
    {
        id: "S",
        title: "S",
        color: "#4caf20",
    },
    {
        id: "A",
        title: "A",
        color: "#4caf50",
    },
    {
        id: "B",
        title: "B",
        color: "#ffeb3b",
    },
    {
        id: "C",
        title: "C",
        color: "#ff9800",
    },
    {
        id: "D",
        title: "D",
        color: "#f44336",
    }
];

const generateId = () => {
    return Math.floor(Math.random() * 10001);
};

export const useTierStore = create<TierState>((set, get) => ({
    // Initial state
    columns: defaultCols,
    cards: [],
    activeColumn: null,
    activeCard: null,
    title: "Tier Maker",
    editMode: false,

    // Actions
    setTitle: (title) => set({ title }),
    toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
    setEditMode: (editMode) => set({ editMode }),
    setColumns: (columns) => set({ columns }),
    setCards: (cards) => set({ cards }),
    setActiveColumn: (activeColumn) => set({ activeColumn }),
    setActiveCard: (activeCard) => set({ activeCard }),

    // Column actions
    createColumn: () => {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${get().columns.length + 1}`,
            color: "#09203f",
        };
        set((state) => ({ columns: [...state.columns, columnToAdd] }));
    },

    deleteColumn: (id) => {
        set((state) => ({
            columns: state.columns.filter((col) => col.id !== id),
            cards: state.cards.filter((card) => card.columnId !== id)
        }));
    },

    updateColumn: (id, title) => {
        set((state) => ({
            columns: state.columns.map((col) => {
                if (col.id !== id) return col;
                return { ...col, title };
            })
        }));
    },

    updateColumnColor: (id, color) => {
        set((state) => ({
            columns: state.columns.map((col) => {
                if (col.id !== id) return col;
                return { ...col, color };
            })
        }));
    },

    // Card actions
    createCard: (columnId) => {
        const newCard: Card = {
            id: generateId(),
            columnId,
            content: `Card ${get().cards.length + 1}`
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
    },

    deleteCard: (id) => {
        set((state) => ({
            cards: state.cards.filter((card) => card.id !== id)
        }));
    },

    updateCard: (id, content) => {
        set((state) => ({
            cards: state.cards.map((card) => {
                if (card.id !== id) return card;
                return { ...card, content };
            })
        }));
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

        set((state) => {
            const activeColumnIndex = state.columns.findIndex((col) => col.id === activeId);
            const overColumnIndex = state.columns.findIndex((col) => col.id === overId);
            return {
                columns: arrayMove(state.columns, activeColumnIndex, overColumnIndex)
            };
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

        if (isActiveATask && isOverATask) {
            set((state) => {
                const activeIndex = state.cards.findIndex((t) => t.id === activeId);
                const overIndex = state.cards.findIndex((t) => t.id === overId);

                if (state.cards[activeIndex].columnId !== state.cards[overIndex].columnId) {
                    // Create a new array with the modified card
                    const newCards = [...state.cards];
                    newCards[activeIndex] = {
                        ...newCards[activeIndex],
                        columnId: newCards[overIndex].columnId
                    };
                    return {
                        cards: arrayMove(newCards, activeIndex, overIndex - 1)
                    };
                }

                return {
                    cards: arrayMove(state.cards, activeIndex, overIndex)
                };
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";
        if (isActiveATask && isOverAColumn) {
            set((state) => {
                const activeIndex = state.cards.findIndex((t) => t.id === activeId);
                const newCards = [...state.cards];
                newCards[activeIndex] = {
                    ...newCards[activeIndex],
                    columnId: overId
                };

                return {
                    cards: arrayMove(newCards, activeIndex, activeIndex)
                };
            });
        }
    }
}));