'use client';

import { useMemo, useState, useEffect } from 'react';
import styles from './DateStrip.module.css';

export default function DateStrip({ selectedDate, onDateChange }) {
    const [activeDates, setActiveDates] = useState(new Set());

    // Generate dates for the window centered on selectedDate
    const dates = useMemo(() => {
        let currentDate = new Date(selectedDate);
        if (isNaN(currentDate.getTime())) {
            currentDate = new Date(); // Fallback to today
        }
        const dayList = [];

        // Use a loop to generate -3 to +3 days
        for (let i = -3; i <= 3; i++) {
            const d = new Date(currentDate);
            d.setDate(currentDate.getDate() + i);
            dayList.push(d);
        }
        return dayList;
    }, [selectedDate]);

    // Fetch activity when the date window changes
    useEffect(() => {
        if (dates.length === 0) return;

        const start = dates[0].toISOString().split('T')[0];
        const end = dates[dates.length - 1].toISOString().split('T')[0];

        fetch(`/api/wins/activity?start=${start}&end=${end}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setActiveDates(new Set(data));
                }
            })
            .catch(err => console.error('Failed to fetch activity', err));
    }, [dates]);

    const handlePrev = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        onDateChange(d.toISOString().split('T')[0]);
    };

    const handleNext = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        onDateChange(d.toISOString().split('T')[0]);
    };

    const handleSelect = (dateObj) => {
        onDateChange(dateObj.toISOString().split('T')[0]);
    };

    const isToday = (dateObj) => {
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
        const dateStr = dateObj.toISOString().split('T')[0];
        return todayStr === dateStr;
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={styles.stripContainer}>
            <button onClick={handlePrev} className={styles.navBtn} aria-label="Previous day">
                &lt;&lt;
            </button>

            <div className={styles.daysRow}>
                {dates.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const selectedDateStr = selectedDate;
                    const active = dateStr === selectedDateStr;
                    const hasActivity = activeDates.has(dateStr);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => handleSelect(date)}
                            className={`${styles.dayBtn} ${active ? styles.active : ''} ${hasActivity ? styles.hasWin : ''} ${isToday(date) ? styles.isToday : ''}`}
                        >
                            <span className={styles.dayName}>{daysOfWeek[date.getUTCDay()]}</span>
                            <span className={styles.dayNumber}>{date.getUTCDate()}</span>
                        </button>
                    );
                })}
            </div>

            <button onClick={handleNext} className={styles.navBtn} aria-label="Next day">
                &gt;&gt;
            </button>
        </div>
    );
}

