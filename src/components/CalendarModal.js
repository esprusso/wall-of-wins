'use client';

import { useState, useEffect } from 'react';
import styles from './CalendarModal.module.css';

export default function CalendarModal({ isOpen, onClose, selectedDate, onDateChange }) {
    // Current month view (defaults to selectedDate or Today)
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (selectedDate) {
            const [year, month, day] = selectedDate.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        return new Date();
    });

    const [winsMap, setWinsMap] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Sync currentMonth when modal opens
    useEffect(() => {
        if (isOpen) {
            let dateToUse;
            if (selectedDate) {
                const [year, month, day] = selectedDate.split('-').map(Number);
                dateToUse = new Date(year, month - 1, day);
            } else {
                dateToUse = new Date();
            }
            // Ensure we start at the 1st of the month to avoid edge cases dealing with month lengths
            dateToUse.setDate(1);
            setCurrentMonth(dateToUse);
        }
    }, [isOpen, selectedDate]);

    // Fetch wins for the displayed month
    useEffect(() => {
        if (!isOpen) return;

        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const query = `${year}-${month}`;

        setIsLoading(true);
        fetch(`/api/wins/monthly?month=${query}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWinsMap(new Set(data));
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [currentMonth, isOpen]);

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    const handleDayClick = (day) => {
        // Construct date string YYYY-MM-DD
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const fullDate = `${year}-${month}-${dayStr}`;

        onDateChange(fullDate);
        onClose();
    };

    if (!isOpen) return null;

    // Calendar Generation Logic
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
        return day === selDay &&
            month === (selMonth - 1) &&
            year === selYear;
    };

    const hasWin = (day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return winsMap.has(`${year}-${m}-${d}`);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <button className={styles.navBtn} onClick={handlePrevMonth}>&lt;</button>
                    <div className={styles.modalTitle}>
                        {monthNames[month]} {year}
                    </div>
                    <button className={styles.navBtn} onClick={handleNextMonth}>&gt;</button>
                </header>

                <div className={styles.grid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className={styles.dayHeader}>{d}</div>
                    ))}

                    {days.map((day, idx) => {
                        if (day === null) {
                            return <div key={`empty-${idx}`} className={`${styles.cell} ${styles.cellDisabled}`} />;
                        }

                        const todayClass = isToday(day) ? styles.cellToday : '';
                        const selectedClass = isSelected(day) ? styles.cellSelected : '';

                        return (
                            <div
                                key={day}
                                className={`${styles.cell} ${todayClass} ${selectedClass}`}
                                onClick={() => handleDayClick(day)}
                            >
                                {day}
                                {hasWin(day) && (
                                    <span className={styles.indicator}>⭐️</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
