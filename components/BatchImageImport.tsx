import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from './ui/dialog';
import { UploadIcon, ImageIcon } from 'lucide-react';
import { useTierStore } from '@/store/tierStore';
import { Id } from '@/app/types';

interface BatchImageImportProps {
    columnId: Id;
}

export const BatchImageImport = ({ columnId }: BatchImageImportProps) => {
    const { createCard, updateCardImage } = useTierStore();
    const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Process each file
        const newImages: Array<{ file: File; preview: string }> = [];

        Array.from(files).forEach(file => {
            // Skip non-image files
            if (!file.type.startsWith('image/')) return;

            // Create a preview
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    newImages.push({
                        file,
                        preview: event.target.result as string
                    });

                    // Update state when all images are processed
                    if (newImages.length === files.length) {
                        setImages(prev => [...prev, ...newImages]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = e.dataTransfer.files;
            const newImages: Array<{ file: File; preview: string }> = [];

            Array.from(files).forEach(file => {
                if (!file.type.startsWith('image/')) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newImages.push({
                            file,
                            preview: event.target.result as string
                        });

                        if (newImages.length === files.length) {
                            setImages(prev => [...prev, ...newImages]);
                        }
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const importImages = async () => {
        setImporting(true);

        // Create a card for each image
        for (const image of images) {
            // Create a new card
            const cardId = await createCard(columnId);

            // Update the card with the image
            updateCardImage(cardId, image.preview);

            // Add a small delay to prevent overwhelming the UI
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Reset and close
        setImages([]);
        setImporting(false);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setIsOpen(true)}
                >
                    <ImageIcon size={16} />
                    <span>Import Images</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Batch Import Images</DialogTitle>
                    <DialogDescription>
                        Add multiple images at once. Each image will create a new card.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                            Drag 'n' drop images here, or click to select files
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                        />
                    </div>

                    {images.length > 0 && (
                        <div>
                            <p className="text-sm mb-2">Selected images ({images.length}):</p>
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index}`}
                                            className="w-full aspect-square object-cover rounded-md"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => setIsOpen(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={importImages}
                        disabled={images.length === 0 || importing}
                    >
                        {importing ? 'Importing...' : `Import ${images.length} Images`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};