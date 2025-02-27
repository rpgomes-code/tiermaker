import React, { useEffect, useState } from 'react';
import { FolderOpen, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { useTierStore } from '@/store/tierStore';

interface SavedTierList {
    id: string;
    title: string;
    savedAt: string;
}

export const LoadTierList = () => {
    const [savedLists, setSavedLists] = useState<SavedTierList[]>([]);
    const { loadTierList } = useTierStore();

    // Function to refresh the list of saved tier lists
    const loadSavedLists = () => {
        const lists: SavedTierList[] = [];

        // Loop through localStorage to find saved tier lists
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tierMaker_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '');
                    lists.push({
                        id: key.replace('tierMaker_', ''),
                        title: data.title,
                        savedAt: data.savedAt || 'Unknown date'
                    });
                } catch (e) {
                    console.error('Failed to parse saved list:', e);
                }
            }
        }

        // Sort by saved date (newest first)
        lists.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        setSavedLists(lists);
    };

    // Load saved lists when component mounts
    useEffect(() => {
        loadSavedLists();
    }, []);

    // Handle loading a saved tier list
    const handleLoadList = (id: string) => {
        const success = loadTierList(id);
        if (!success) {
            alert('Failed to load tier list. It may be corrupted or deleted.');
        }
    };

    // Handle deleting a saved tier list
    const handleDeleteList = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the parent click handler

        if (confirm('Are you sure you want to delete this tier list?')) {
            try {
                localStorage.removeItem('tierMaker_' + id);
                loadSavedLists(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete tier list:', error);
                alert('Failed to delete tier list. Please try again.');
            }
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <FolderOpen size={16} />
                    <span>Load Saved</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Your Saved Tier Lists</DialogTitle>
                </DialogHeader>
                <div className="max-h-80 overflow-y-auto">
                    {savedLists.length > 0 ? (
                        <div className="space-y-2">
                            {savedLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                    onClick={() => handleLoadList(list.id)}
                                >
                                    <div>
                                        <h3 className="font-medium">{list.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {new Date(list.savedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteList(list.id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4 text-gray-500">You haven't saved any tier lists yet.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};