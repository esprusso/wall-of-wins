'use client';

import React from 'react';
import Navbar from './Navbar';
import NavigationSidebar from './NavigationSidebar';
import { useAppContext } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';

export default function AppShell({ children }) {
    const {
        isSidebarOpen, setIsSidebarOpen,
        theme, toggleTheme,
        searchQuery, setSearchQuery,
        setIsMonthlyCalendarOpen, setIsHeatmapOpen
    } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = (query) => {
        // If we are implemented global search state
        if (setSearchQuery) setSearchQuery(query);
    };

    return (
        <>
            <Navbar />
            <NavigationSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                searchQuery={searchQuery || ''}
                onSearch={handleSearch}
                onDailyWallClick={() => {
                    setIsSidebarOpen(false);
                    router.push('/');
                }}
                onCalendarClick={() => {
                    setIsSidebarOpen(false);
                    setIsMonthlyCalendarOpen(true);
                    if (pathname !== '/') router.push('/');
                }}
                onHallOfFameClick={() => {
                    setIsSidebarOpen(false);
                    // Link handled inside Sidebar
                }}
                onConsistencyClick={() => {
                    setIsSidebarOpen(false);
                    setIsHeatmapOpen(true);
                    if (pathname !== '/') router.push('/');
                }}
                onThemeToggle={toggleTheme}
                theme={theme}
            />
            {children}
        </>
    );
}
