import React from 'react';
import { Card } from '@/app/types';
import { useTierStore } from '@/store/tierStore';

interface ImageGridViewProps {
    cards: Card[];
    columnTitle: string;
}

/**
 * A component to display all images in a tier as a grid
 */
export const ImageGridView = ({ cards, columnTitle }: ImageGridViewProps) => {
    // Filter only cards with images
    const cardsWithImages = cards.filter(card => card.imageUrl);

    // If no cards with images, don't render anything
    if (cardsWithImages.length === 0) {
        return null;
    }

    return (
        <div className="p-4 border border-gray-700 rounded-md my-2">
            <h3 className="text-lg font-medium mb-2">{columnTitle} - Image Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cardsWithImages.map(card => (
                    <div key={card.id} className="relative overflow-hidden rounded-md group">
                        <img
                            src={card.imageUrl}
                            alt={card.content}
                            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-sm text-white">{card.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};