'use client';

import { useState, useEffect, useRef, cloneElement } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import StickyNote from '@/components/StickyNote';
import DateStrip from '@/components/DateStrip';
import CalendarModal from '@/components/CalendarModal';
import HeatmapModal from '@/components/HeatmapModal';
import NavigationSidebar from '@/components/NavigationSidebar';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import toast, { Toaster } from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import styles from './page.module.css';

// DnD Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import SortableWin from '@/components/SortableWin';

export default function Home() {
    const { searchQuery, isHeatmapOpen, isMonthlyCalendarOpen, setIsHeatmapOpen, setIsMonthlyCalendarOpen, fetchStats } = useAppContext();
    const [dailyWins, setDailyWins] = useState([]);
    const [starredWins, setStarredWins] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedColor, setSelectedColor] = useState('yellow'); // Default color
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [customColor, setCustomColor] = useState('#ffffff'); // For color picker
    const colorInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize theme on mount
    // Initialize date and stats on mount
    useEffect(() => {
        // Get local date YYYY-MM-DD
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
        setSelectedDate(localDate);

        fetchStats();
    }, []);

    // Fetch Logic
    const fetchDailyWins = async (date) => {
        if (!date) return;
        try {
            const res = await fetch(`/api/wins?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setDailyWins(data);
            }
        } catch (error) {
            console.error('Failed to fetch daily wins', error);
        }
    };

    const fetchStarredWins = async () => {
        try {
            const res = await fetch(`/api/wins?starred=true`);
            if (res.ok) {
                const data = await res.json();
                setStarredWins(data);
            }
        } catch (error) {
            console.error('Failed to fetch starred wins', error);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        await Promise.all([
            fetchDailyWins(selectedDate),
            fetchStarredWins()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        if (selectedDate) {
            setLoading(true);
            fetchDailyWins(selectedDate).finally(() => setLoading(false));
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchStarredWins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fetchStats is now from context

    const fetchActivityData = async () => {
        try {
            const res = await fetch('/api/wins/activity');
            if (res.ok) {
                const data = await res.json();
                setActivityData(data);
            }
        } catch (error) {
            console.error('Failed to fetch activity data', error);
        }
    };

    useEffect(() => {
        if (isHeatmapOpen) {
            fetchActivityData();
        }
    }, [isHeatmapOpen]);

    // Handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleAddWin = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        try {
            // Check if we have an image to upload
            let body;
            let headers = {};

            if (selectedImage) {
                const formData = new FormData();
                formData.append('content', inputValue);
                formData.append('date_created', selectedDate);
                formData.append('color', selectedColor);
                formData.append('image', selectedImage);
                body = formData;
                // Don't set Content-Type header manually for FormData, let browser set it with boundary
            } else {
                body = JSON.stringify({
                    content: inputValue,
                    date_created: selectedDate,
                    color: selectedColor
                });
                headers = { 'Content-Type': 'application/json' };
            }

            const res = await fetch('/api/wins', {
                method: 'POST',
                headers: headers,
                body: body,
            });

            if (res.ok) {
                // Celebration!
                if (dailyWins.length === 0) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }

                setInputValue('');
                setSelectedImage(null);
                setPreviewUrl(null);
                // Reset file input
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchDailyWins(selectedDate);
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to add win', error);
        }
    };

    const handleToggleStar = async (id) => {
        try {
            const res = await fetch(`/api/wins/${id}/star`, {
                method: 'PATCH',
            });
            if (res.ok) {
                refreshData();
            }
        } catch (error) {
            console.error('Failed to toggle star', error);
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Delete this win?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const res = await fetch(`/api/wins/${id}`, {
                                    method: 'DELETE',
                                });
                                if (res.ok) {
                                    refreshData();
                                    toast.success('Win deleted');
                                }
                            } catch (error) {
                                console.error('Failed to delete win', error);
                                toast.error('Failed to delete');
                            }
                        }}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            backgroundColor: '#e5e7eb',
                            color: 'black',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 4000,
            position: 'top-center',
        });
    };

    const handleUpdate = async (id, newContent) => {
        try {
            const res = await fetch(`/api/wins/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent }),
            });
            if (res.ok) {
                refreshData();
                fetchStats();
            }
        } catch (error) {
            console.error('Failed to update win', error);
        }
    };

    // Search Effect
    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                const res = await fetch(`/api/wins/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Search failed', error);
            }
        };

        performSearch();
    }, [searchQuery]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setDailyWins((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist to DB
                const reorderPayload = newItems.map((item, index) => ({ id: item.id, order: index }));
                fetch('/api/wins/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: reorderPayload })
                }).catch(err => console.error('Reorder failed', err));

                return newItems;
            });
        }
    };

    const colors = [
        { id: 'yellow', label: 'General', class: styles.bgYellow },
        { id: 'green', label: 'Personal/Health', class: styles.bgGreen },
        { id: 'blue', label: 'Work', class: styles.bgBlue },
        { id: 'pink', label: 'Creative/Fun', class: styles.bgPink },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Wall of Wins" className={styles.logo} />
            </div>

            <main className={styles.mainColumn}>

                {/* Date Picker */}
                {/* Date Strip Navigation */}

                <form onSubmit={handleAddWin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        {/* File Upload Button (Left Icon) */}
                        <button
                            type="button"
                            className={styles.inputIconLeft}
                            onClick={triggerFileSelect}
                            title="Add Photo"
                        >
                            📷
                        </button>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Main Input */}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="What's your win?"
                            className={styles.input}
                        />

                        {/* Submit Button (Right Icon) */}
                        <button
                            type="submit"
                            className={styles.inputIconRight}
                            title="Add Win"
                        >
                            ➔
                        </button>
                    </div>

                    {/* Image Preview */}
                    {previewUrl && (
                        <div className={styles.previewContainer}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                            <button
                                type="button"
                                className={styles.removePreviewBtn}
                                onClick={() => {
                                    setSelectedImage(null);
                                    setPreviewUrl(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >✕</button>
                        </div>
                    )}

                    {/* Color Picker Dots */}
                    <div className={styles.colorPickerContainer}>
                        <div className={styles.colorPicker}>
                            {colors.map((c) => (
                                <div
                                    key={c.id}
                                    className={`${styles.colorDot} ${c.class} ${selectedColor === c.id ? styles.colorDotSelected : ''}`}
                                    onClick={() => setSelectedColor(c.id)}
                                    onMouseEnter={() => setHoveredCategory(c.label)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                />
                            ))}

                            {/* Custom Color Dot */}
                            <div
                                className={`${styles.colorDot} ${styles.bgCustom} ${selectedColor === customColor ? styles.colorDotSelected : ''}`}
                                onClick={() => colorInputRef.current?.click()}
                                onMouseEnter={() => setHoveredCategory('Custom Color')}
                                onMouseLeave={() => setHoveredCategory(null)}
                                style={selectedColor.startsWith('#') && selectedColor !== customColor ? { background: selectedColor } : {}}
                            >
                                <input
                                    type="color"
                                    ref={colorInputRef}
                                    style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                                    value={customColor}
                                    onChange={(e) => {
                                        const hex = e.target.value;
                                        setCustomColor(hex);
                                        setSelectedColor(hex);
                                    }}
                                />
                            </div>
                        </div>
                        <div className={styles.categoryNameDisplay}>
                            {hoveredCategory || colors.find(c => c.id === selectedColor)?.label || (selectedColor.startsWith('#') ? 'Custom Color' : '')}
                        </div>
                    </div>
                </form>

                <div className={styles.grid}>
                    {searchQuery ? (
                        searchResults.length === 0 ? (
                            <p className={styles.empty}>No matches found</p>
                        ) : (
                            searchResults.map((win) => (
                                <StickyNote
                                    key={`search-${win.id}`}
                                    win={win}
                                    onToggleStar={handleToggleStar}
                                    onDelete={handleDelete}
                                    onUpdate={handleUpdate}
                                />
                            ))
                        )
                    ) : loading && dailyWins.length === 0 ? (
                        <p>Loading wins...</p>
                    ) : dailyWins.length === 0 ? (
                        <p className={styles.empty}>Nothing logged.</p>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={dailyWins.map(w => w.id)}
                                strategy={rectSortingStrategy}
                            >
                                {dailyWins.map((win) => (
                                    <SortableWin
                                        key={win.id}
                                        win={win}
                                        onToggleStar={handleToggleStar}
                                        onDelete={handleDelete}
                                        onUpdate={handleUpdate}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

            </main>

            {/* Fixed Bottom Timeline */}
            <div className={styles.bottomNav}>
                <div className={styles.controls}>
                    <DateStrip
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                </div>
            </div>


            <Toaster position="bottom-center" />
            <CalendarModal
                isOpen={isMonthlyCalendarOpen}
                onClose={() => setIsMonthlyCalendarOpen(false)}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />
            <HeatmapModal
                isOpen={isHeatmapOpen}
                onClose={() => setIsHeatmapOpen(false)}
                activityData={activityData}
            />
        </div >
    );
}
