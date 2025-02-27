import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
    onImageSelected: (imageUrl: string) => void;
    currentImage?: string;
    onRemoveImage?: () => void;
}

export const ImageUploader = ({
                                  onImageSelected,
                                  currentImage,
                                  onRemoveImage
                              }: ImageUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onImageSelected(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    if (currentImage) {
        return (
            <div className="relative w-full h-full">
                <img
                    src={currentImage}
                    alt="Card"
                    className="w-full h-full object-cover rounded"
                />
                {onRemoveImage && (
                    <button
                        onClick={onRemoveImage}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                        title="Remove image"
                    >
                        <X size={16} className="text-white" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-md p-2 ${
                isDragging ? 'border-blue-500 bg-blue-50 bg-opacity-10' : 'border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Upload size={20} className="mb-1" />
            <p className="text-xs text-center">Drag image or</p>
            <label className="cursor-pointer text-xs text-blue-500">
                Browse
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};