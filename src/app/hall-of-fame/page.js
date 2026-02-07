'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StickyNote from '@/components/StickyNote';
import styles from './page.module.css';

export default function HallOfFame() {
    const [starredWins, setStarredWins] = useState([]);
    const [filteredWins, setFilteredWins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const winsRes = await fetch('/api/wins?starred=true');

                if (winsRes.ok) {
                    const wins = await winsRes.json();
                    setStarredWins(wins);
                    setFilteredWins(wins);
                }
            } catch (error) {
                console.error('Failed to fetch HOF data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredWins(starredWins);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredWins(starredWins.filter(win =>
                win.content.toLowerCase().includes(query)
            ));
        }
    }, [searchQuery, starredWins]);


    // We need to implement a simple masonry grid if we don't install a package.
    // The user suggested generic "react-masonry-css" but we don't have it installed.
    // I will implement a simple CSS column layout or use a lightweight custom hook logic if needed.
    // Actually, simple CSS columns `column-count` works well for simple vertical masonry.
    // Let's try CSS columns first in module.css, but distributing items into colums in JS is safer for React.
    // I'll simulate columns by distributing items.

    // Simple custom masonry distribution for now to avoid hydration mismatch with CSS columns sometimes
    const getColumns = (items, cols) => {
        const columns = Array.from({ length: cols }, () => []);
        items.forEach((item, index) => {
            columns[index % cols].push(item);
        });
        return columns;
    };

    // Actually standard CSS masonry is `column-count`, let's trust Styles first.
    // If we use styles.masonryGrid with column-count, items order top-to-bottom per column.
    // JS distribution orders left-to-right.
    // User wants "interlock beautifully".
    // I'll use a simple Flex approach for now:
    // We can't easily do true masonry without JS or a library for left-to-right ordering.
    // I'll implement a simple column distributor here for 3 columns on desktop. function.

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.certificateSheet}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className={styles.noiseOverlay}></div>
                <div className={styles.vignetteOverlay}></div>
                <div className={styles.pageFrame}></div>

                <header className={styles.header}>
                    <img src="/hof.png" alt="Hall of Fame" className={styles.logo} />
                </header>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search your treasury..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>


                <div className={styles.masonryWrapper}>
                    {filteredWins.map(win => (
                        <div key={win.id} className={styles.masonryItem}>
                            <StickyNote
                                win={win}
                                // Read-only in gallery? Or allow edit? User didn't specify. Assuming read-onlyish or full feature.
                                // Let's keep full features but pass handlers if needed.
                                // If we want it read only we can pass no-op handlers. 
                                // "Re-use the WinCard component".
                                onToggleStar={() => { }} // Maybe allow unstarring? Let's disable for safety or implement if requested.
                                onDelete={() => { }}
                                onUpdate={() => { }}
                                isGalleryView={true}
                            />
                        </div>
                    ))}
                </div>

            </motion.div>

            {/* Note: pure CSS columns order items vertically first (down col 1, then col 2). 
                If the user wants chronological left-to-right, we need JS masonry. 
                For now, CSS columns is the simplest robust solution without dependencies. 
            */}
        </div >
    );
}
