'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import StickyNote from '@/components/StickyNote';
import DateStrip from '@/components/DateStrip';
import CalendarModal from '@/components/CalendarModal';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import toast, { Toaster } from 'react-hot-toast';
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
    const [dailyWins, setDailyWins] = useState([]);
    const [starredWins, setStarredWins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedColor, setSelectedColor] = useState('yellow'); // Default color
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isMonthlyCalendarOpen, setIsMonthlyCalendarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [theme, setTheme] = useState('auto'); // Default to auto
    const [effectiveTheme, setEffectiveTheme] = useState('light');
    const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, totalWins: 0 }); // Stats state
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
    // Initialize theme, date, and stats on mount
    useEffect(() => {
        // Get local date YYYY-MM-DD
        const now = new Date();
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
        setSelectedDate(localDate);

        // Load theme from local storage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }

        fetchStats();
    }, []);

    // Handle theme changes and system preference listeners
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            let newTheme = theme;
            if (theme === 'auto') {
                newTheme = mediaQuery.matches ? 'dark' : 'light';
            }
            setEffectiveTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        };

        applyTheme(); // Apply immediately

        // Listen for system changes if in auto mode
        if (theme === 'auto') {
            mediaQuery.addEventListener('change', applyTheme);
        }

        // Persist preference
        if (theme === 'auto') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }

        return () => mediaQuery.removeEventListener('change', applyTheme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'auto';
            return 'light';
        });
    };

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
            fetchDailyWins(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchStarredWins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/wins/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

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
        if (isCalendarOpen) {
            fetchActivityData();
        }
    }, [isCalendarOpen]);

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

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`/api/wins/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Search failed', error);
        }
    };

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
            <div className={styles.topLeftControls}>
                <div className={styles.searchWrapper}>
                    <button
                        className={styles.searchIconBtn}
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Toggle Search"
                    >
                        🔍
                    </button>
                    <input
                        type="text"
                        placeholder="Search memories..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`${styles.searchInputMain} ${isSearchOpen ? styles.expanded : ''}`}
                        onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                    />
                </div>
            </div>

            <div className={styles.topRightControls}>
                <div className={styles.streakCounter} title="Current Streak">
                    <span className={styles.fireIcon}>🔥</span>
                    <span className={styles.streakCount}>{stats.currentStreak}</span>
                </div>
                <button
                    className={styles.floatingBtn}
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    style={{ marginRight: '1rem' }}
                >
                    {theme === 'auto' ? '🌗' : (theme === 'light' ? '🌙' : '☀️')}
                </button>
                <button
                    className={styles.floatingBtn}
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    aria-label="Toggle Calendar"
                    style={{ marginRight: '1rem' }}
                >
                    📅
                </button>
                <button
                    className={styles.floatingBtn}
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    aria-label="Toggle Hall of Fame"
                >
                    🏆
                </button>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                    <button
                        className={styles.floatingBtn}
                        aria-label="Settings"
                        style={{ marginLeft: '1rem' }}
                    >
                        ⚙️
                    </button>
                </Link>
            </div>

            <div
                className={`${styles.backdrop} ${(isDrawerOpen || isCalendarOpen) ? styles.backdropOpen : ''}`}
                onClick={() => {
                    setIsDrawerOpen(false);
                    setIsCalendarOpen(false);
                }}
            />

            <main className={styles.mainColumn}>
                <div className={styles.logoContainer}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Wall of Wins" className={styles.logo} />
                </div>

                {/* Date Picker */}
                {/* Date Strip Navigation */}
                <div className={styles.controls}>
                    <DateStrip
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                    <button
                        className={styles.iconButton} // We can reuse iconButton or create a new style
                        onClick={() => setIsMonthlyCalendarOpen(true)}
                        aria-label="Open Monthly View"
                        title="Month View"
                        style={{ marginLeft: '10px', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        🗓️
                    </button>
                </div>

                <form onSubmit={handleAddWin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="What's your win?"
                            className={styles.input}
                        />

                        {/* File Upload Button */}
                        <button
                            type="button"
                            className={styles.iconButton}
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

                        <button type="submit" className={styles.addButton}>Add Win</button>
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

                    {/* Color Picker with Labels */}
                    <div className={styles.colorPicker}>
                        {colors.map((c) => (
                            <div
                                key={c.id}
                                className={`${styles.colorOptionRow} ${selectedColor === c.id ? styles.colorOptionSelected : ''}`}
                                onClick={() => setSelectedColor(c.id)}
                            >
                                <div className={`${styles.colorCircle} ${c.class}`} />
                                <span className={styles.colorLabel}>{c.label}</span>
                            </div>
                        ))}
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
                        <p className={styles.empty}>No wins for this day. Add one above!</p>
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

            <aside className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
                <h2 className={styles.subtitle}>Hall of Fame ⭐️</h2>

                <div className={styles.statsSummary}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total Wins</span>
                        <span className={styles.statValue}>{stats.totalWins}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Best Streak</span>
                        <span className={styles.statValue}>{stats.bestStreak}</span>
                    </div>
                </div>

                <div className={styles.grid} style={{ flexDirection: 'column', alignItems: 'center' }}>
                    {starredWins.length === 0 ? (
                        <p className={styles.empty} style={{ fontSize: '1rem' }}>Star a win to see it here!</p>
                    ) : (
                        starredWins.map((win) => (
                            <StickyNote
                                key={`starred-${win.id}`}
                                win={win}
                                onToggleStar={handleToggleStar}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))
                    )}
                </div>
            </aside>

            <aside className={`${styles.drawer} ${isCalendarOpen ? styles.drawerOpen : ''}`}>
                <h2 className={styles.subtitle}>Consistency 📅</h2>

                <div className={styles.heatmapContainer} style={{ marginBottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    {activityData.length > 0 ? (
                        <>
                            <ActivityCalendar
                                data={activityData}
                                theme={{
                                    light: ['#d1d5db', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
                                    dark: ['#3f3f46', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
                                }}
                                labels={{
                                    legend: {
                                        less: 'Less',
                                        more: 'More',
                                    },
                                }}
                                showWeekdayLabels
                                blockSize={12}
                                blockMargin={4}
                                fontSize={12}
                                renderBlock={(block, activity) => {
                                    const { key, ...blockProps } = block;
                                    return (
                                        <div
                                            key={key}
                                            {...blockProps}
                                            data-tooltip-id="react-tooltip"
                                            data-tooltip-content={`${activity.count} wins on ${activity.date}`}
                                        />
                                    );
                                }}
                            />
                            <Tooltip id="react-tooltip" />
                        </>
                    ) : (
                        <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Start recording wins to see your streak!
                        </p>
                    )}
                </div>
            </aside>
            <Toaster position="bottom-center" />
            <CalendarModal
                isOpen={isMonthlyCalendarOpen}
                onClose={() => setIsMonthlyCalendarOpen(false)}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />
        </div >
    );
}
