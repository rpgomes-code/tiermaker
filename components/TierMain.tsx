"use client"
import React, { useMemo } from 'react'
import { Id } from "@/app/types"
import { useSensors, useSensor, PointerSensor,
    DndContext
} from "@dnd-kit/core"
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable"
import { ColumnContainer } from "./ColumnContainer"
import { useTierStore } from '@/store/tierStore'

export const TierMain = () => {
    const {
        columns,
        cards,
        title,
        editMode,
        setTitle,
        setEditMode,
        createColumn,
        onDragStart,
        onDragEnd,
        onDragOver
    } = useTierStore();

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    // Configure sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    return (
        <div className="flex min-h-screen w-full justify-center items-center p-8">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="flex flex-col gap-2 w-[1200px]">
                    {editMode
                        ?
                        <input className="bg-black border rounded outline-none px-2 w-full text-xl"
                               value={title}
                               onChange={(e) => setTitle(e.target.value)}
                               onBlur={() => {
                                   setEditMode(false);
                               }}
                               onKeyDown={(e) => {
                                   if (e.key !== "Enter") return
                                   setEditMode(false);
                               }}
                        />
                        :
                        <h1 className="text-xl" onClick={() => setEditMode(true)}>
                            {title}
                        </h1>
                    }
                    <button onClick={createColumn}
                            className="flex h-[60px] w-full min-w-[330px] cursor-pointer
                        rounded-lg p-4 ring-blue-500"
                    >
                        <span className="w-6 h-6 mr-[5px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-plus">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12h8" />
                                <path d="M12 8v8" />
                            </svg>
                        </span>
                        Add Tier
                    </button>
                    <div className="flex flex-col gap-1">
                        <SortableContext items={columnsId} strategy={rectSwappingStrategy}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    className=""
                                    cards={cards.filter((card) => card.columnId === col.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>
                </div>
            </DndContext>
        </div>
    );
};