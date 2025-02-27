import React from 'react';
import html2canvas from 'html2canvas';
import { Save, Share, Download, Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { useTierStore } from '@/store/tierStore';

interface TierExportProps {
    boardRef: React.RefObject<HTMLDivElement>;
}

export const TierExport = ({ boardRef }: TierExportProps) => {
    const { title, columns, cards, saveTierList } = useTierStore();

    // Function to save current tier state to localStorage
    const saveToLocalStorage = () => {
        const success = saveTierList();
        if (success) {
            alert('Tier list saved successfully!');
        } else {
            alert('Failed to save tier list. Please try again.');
        }
    };

    // Function to export as image
    const exportAsImage = async () => {
        if (!boardRef.current) return;

        try {
            // Show a temporary "Exporting..." message to the user
            const exportingMessage = document.createElement('div');
            exportingMessage.innerText = 'Exporting...';
            exportingMessage.className = 'fixed top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded z-50';
            document.body.appendChild(exportingMessage);

            // Slight delay to ensure message is visible
            await new Promise(resolve => setTimeout(resolve, 100));

            // Create the image
            const canvas = await html2canvas(boardRef.current, {
                backgroundColor: '#121212', // Match the dark theme background
                scale: 2, // Improve quality
            });

            // Remove the exporting message
            document.body.removeChild(exportingMessage);

            // Convert to image and download
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `${title.replace(/\s+/g, '_')}_tier_list.png`;
            link.click();
        } catch (error) {
            console.error('Failed to export image:', error);
            alert('Failed to export image. Please try again.');
        }
    };

    // Function to copy shareable link
    const copyShareableLink = () => {
        // Create data object for sharing
        const tierData = {
            title,
            columns,
            cards
        };

        try {
            // Encode as base64 string for URL
            const encodedData = btoa(JSON.stringify(tierData));
            const shareableUrl = `${window.location.origin}?data=${encodedData}`;

            // Copy to clipboard
            navigator.clipboard.writeText(shareableUrl)
                .then(() => alert('Shareable link copied to clipboard!'))
                .catch(err => {
                    console.error('Failed to copy link:', err);
                    alert('Failed to copy link. Please try again.');
                });
        } catch (error) {
            console.error('Failed to create shareable link:', error);
            alert('Failed to create shareable link. Your tier list might be too large.');
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Save size={16} />
                    <span>Save / Export</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={saveToLocalStorage}
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                    >
                        <Save size={16} />
                        <span>Save to Browser</span>
                    </Button>

                    <Button
                        onClick={exportAsImage}
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                    >
                        <Camera size={16} />
                        <span>Export as Image</span>
                    </Button>

                    <Button
                        onClick={copyShareableLink}
                        variant="ghost"
                        className="flex items-center justify-start gap-2"
                    >
                        <Share size={16} />
                        <span>Share Link</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};