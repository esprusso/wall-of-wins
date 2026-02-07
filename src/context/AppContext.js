'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
    const [isMonthlyCalendarOpen, setIsMonthlyCalendarOpen] = useState(false);
    const [theme, setTheme] = useState('auto');
    const [effectiveTheme, setEffectiveTheme] = useState('light');
    const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, totalWins: 0 });

    // Initialize Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }

        // Initial stats fetch
        fetchStats();
    }, []);

    // Handle Theme Changes
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

        applyTheme();

        if (theme === 'auto') {
            mediaQuery.addEventListener('change', applyTheme);
        }

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

    const value = {
        isSidebarOpen,
        setIsSidebarOpen,
        searchQuery,
        setSearchQuery,
        isHeatmapOpen,
        setIsHeatmapOpen,
        isMonthlyCalendarOpen,
        setIsMonthlyCalendarOpen,
        theme,
        toggleTheme,
        stats,
        fetchStats
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
