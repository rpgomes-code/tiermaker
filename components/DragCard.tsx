import { Card, Id } from "@/app/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TrashIcon, ImageIcon, X } from "lucide-react"
import React, { useState } from 'react'
import { useTierStore } from "@/store/tierStore"
import { ImageUploader } from "./ImageUploader"

interface Props {
    card: Card
}

export const DragCard = ({ card }: Props) => {
    const { deleteCard, updateCard, updateCardImage, removeCardImage } = useTierStore();
    const [mouseIsOver, setMouseIsOver] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [showImageUploader, setShowImageUploader] = useState(false)
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: {
            type: "Card",
            card,
        },
        disabled: editMode || showImageUploader,
    })
    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    }

    const toggleEditMode = () => {
        setEditMode((prev) => !prev)
        setMouseIsOver(false)
        setShowImageUploader(false)
    }

    const toggleImageUploader = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowImageUploader(prev => !prev)
        setEditMode(false)
    }

    const handleImageSelected = (imageUrl: string) => {
        updateCardImage(card.id, imageUrl)
        setShowImageUploader(false)
    }

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        removeCardImage(card.id)
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style}
                 className="opacity-30 bg-[#0D1117] p-2 w-[100px] min-h-[100px]
                items-center flex text-left rounded-md border-2 border-blue-500
                cursor-grab relative"
            />
        )
    }

    if (showImageUploader) {
        return (
            <div ref={setNodeRef} style={style}
                 className="bg-[#0D1117] p-2 w-[100px] h-[100px] min-h-[100px]
                flex text-left rounded-md border-2 border-blue-500 relative"
            >
                <ImageUploader
                    onImageSelected={handleImageSelected}
                    currentImage={card.imageUrl}
                    onRemoveImage={card.imageUrl ? handleRemoveImage : undefined}
                />
                <button
                    onClick={() => setShowImageUploader(false)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                >
                    <X size={16} className="text-white" />
                </button>
            </div>
        )
    }

    if (editMode) {
        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}
                 className="bg-[#0D1117] p-2 w-[100px] h-[100px] min-h-[100px]
                items-center flex text-left rounded-md border-2 border-blue-500
                cursor-grab relative"
            >
                <textarea className="h-[90%] w-full resize-none border-none rounded
                    bg-transparent text-white focus:outline-none"
                          value={card.content}
                          autoFocus
                          placeholder="card content"
                          onBlur={toggleEditMode}
                          onKeyDown={(e) => {
                              if (e.key === "Enter" && e.shiftKey) {
                                  toggleEditMode()
                              }
                          }}
                          onChange={(e) => updateCard(card.id, e.target.value)}
                />
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
             onClick={toggleEditMode}
             className="bg-[#0D1117] p-2 w-[100px] h-[100px] min-h-[100px]
            items-center flex text-left rounded-md border-2 border-blue-500
            cursor-grab relative"
             onMouseEnter={() => {
                 setMouseIsOver(true)
             }}
             onMouseLeave={() => {
                 setMouseIsOver(false)
             }}
        >
            {card.imageUrl ? (
                <div className="w-full h-full relative">
                    <img
                        src={card.imageUrl}
                        alt={card.content}
                        className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1">
                        <p className="text-xs text-white truncate">{card.content}</p>
                    </div>
                </div>
            ) : (
                <p className="h-[90%] w-full whitespace-pre-wrap">
                    {card.content}
                </p>
            )}

            {mouseIsOver && (
                <div className="absolute right-0 top-20 -translate-y-1/2 flex flex-col gap-1">
                    <button onClick={toggleImageUploader}
                            className="stroke-white bg-black bg-opacity-50 p-2 rounded opacity-60 hover:opacity-100"
                            title="Add/Change Image"
                    >
                        <ImageIcon size={16} />
                    </button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(card.id);
                    }}
                            className="stroke-white bg-black bg-opacity-50 p-2 rounded opacity-60 hover:opacity-100"
                            title="Delete Card"
                    >
                        <TrashIcon size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}