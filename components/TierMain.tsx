"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Id } from "@/app/types"
import { useSensors, useSensor, PointerSensor,
    DndContext
} from "@dnd-kit/core"
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable"
import { ColumnContainer } from "./ColumnContainer"
import { TierExport } from "./TierExport"
import { LoadTierList } from "./LoadTierList"
import { useTierStore } from '@/store/tierStore'
import { Button } from './ui/button'
import { Undo2, Redo2, ImageIcon } from 'lucide-react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BatchImageImport } from './BatchImageImport'

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
        onDragOver,
        loadFromData,
        undo,
        redo,
        canUndo,
        canRedo
    } = useTierStore();

    const [selectedColumnId, setSelectedColumnId] = useState<Id | null>(null);

    const { toast } = useToast();
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
    const boardRef = useRef<HTMLDivElement>(null);

    // Set first column as default for image import when columns change
    useEffect(() => {
        if (columns.length > 0 && !selectedColumnId) {
            setSelectedColumnId(columns[0].id);
        }
    }, [columns, selectedColumnId]);

    // Configure sensors for drag detection
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    // Create wrapper functions for undo/redo to show toast notifications
    const handleUndo = () => {
        if (canUndo()) {
            undo();
            toast({
                title: "Action undone",
                description: "Your previous action has been undone.",
                duration: 1500,
            });
        }
    };

    const handleRedo = () => {
        if (canRedo()) {
            redo();
            toast({
                title: "Action redone",
                description: "Your action has been reapplied.",
                duration: 1500,
            });
        }
    };

    // Set up keyboard shortcuts for undo/redo
    useKeyboardShortcuts({
        onUndo: canUndo() ? handleUndo : undefined,
        onRedo: canRedo() ? handleRedo : undefined,
        canUndo: canUndo(),
        canRedo: canRedo(),
        disabled: editMode // Disable shortcuts when editing title or card content
    });

    // Load tier list from URL if available
    useEffect(() => {
        // Check for data in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                // Decode the base64 data
                const decodedData = JSON.parse(atob(encodedData));

                // Load the tier list
                const success = loadFromData(decodedData);
                if (success) {
                    toast({
                        title: "Tier list loaded",
                        description: "Shared tier list has been loaded successfully.",
                        duration: 3000,
                    });
                } else {
                    console.error('Failed to load tier list from URL');
                    toast({
                        title: "Error loading tier list",
                        description: "The shared list couldn't be loaded correctly.",
                        variant: "destructive",
                        duration: 3000,
                    });
                }

                // Clear the URL parameter to prevent reloading on refresh
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Failed to parse data from URL:', error);
                toast({
                    title: "Error loading tier list",
                    description: "The shared link appears to be invalid.",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        }
    }, [loadFromData, toast]);

    return (
        <div className="flex min-h-screen w-full justify-center items-center p-8">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="flex flex-col gap-2 w-[1200px]">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 flex-1">
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
                            <TooltipProvider>
                                <div className="flex gap-1">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleUndo}
                                                disabled={!canUndo()}
                                                className="transition-opacity"
                                            >
                                                <Undo2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Undo (Ctrl+Z)</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={handleRedo}
                                                disabled={!canRedo()}
                                                className="transition-opacity"
                                            >
                                                <Redo2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Redo (Ctrl+Y or Ctrl+Shift+Z)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </div>
                        <div className="flex gap-2 items-center">
                            {columns.length > 0 && (
                                <>
                                    <Select
                                        value={selectedColumnId?.toString()}
                                        onValueChange={(value) => setSelectedColumnId(value)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Select Tier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map((column) => (
                                                <SelectItem key={column.id} value={column.id.toString()}>
                                                    {column.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedColumnId && (
                                        <BatchImageImport columnId={selectedColumnId} />
                                    )}
                                </>
                            )}
                            <LoadTierList />
                            <TierExport boardRef={boardRef} />
                        </div>
                    </div>
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
                    <div ref={boardRef} className="flex flex-col gap-1">
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