'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { setIsSidebarOpen, stats } = useAppContext();

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftControls}>
                <button
                    className={styles.navButton}
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                >
                    ☰
                </button>
            </div>

            <div className={styles.rightControls}>
                <div className={styles.streakCounter} title="Current Streak">
                    <span className={styles.fireIcon}>🔥</span>
                    <span className={styles.streakCount}>{stats.currentStreak}</span>
                </div>
            </div>
        </nav>
    );
}
