'use client';

import React from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import styles from './HeatmapModal.module.css';

export default function HeatmapModal({ isOpen, onClose, activityData }) {
    if (!isOpen) return null;

    const totalWins = activityData?.reduce((sum, day) => sum + day.count, 0) || 0;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header: Title Left, Close Right */}
                <header className={styles.header}>
                    <div className={styles.titleContainer}>
                        <div className={styles.modalTitle}>Consistency Record</div>
                        <div className={styles.subtitle}>{totalWins} wins in {new Date().getFullYear()}</div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </header>

                {/* Body: Centered Chart */}
                <div className={styles.heatmapContainer}>
                    {activityData && activityData.length > 0 ? (
                        <div className={styles.heatmapWrapper}>
                            <div className={styles.dayLabels}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <span key={day} className={styles.dayLabel}>{day}</span>
                                ))}
                            </div>
                            <ActivityCalendar
                                data={activityData}
                                theme={{
                                    light: ['#e5e7eb', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
                                    dark: ['#3f3f46', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
                                }}
                                showWeekdayLabels={false}
                                hideLegend={true}
                                hideTotalCount={true}
                                blockSize={20}
                                blockMargin={4}
                                fontSize={18}
                                renderBlock={(block, activity) => {
                                    return React.cloneElement(block, {
                                        'data-tooltip-id': 'heatmap-tooltip',
                                        'data-tooltip-content': `${activity.count} wins on ${activity.date}`,
                                    });
                                }}
                            />
                        </div>
                    ) : (
                        <p style={{ color: '#888', fontStyle: 'italic', marginTop: '1rem' }}>
                            Start adding wins to see your streak!
                        </p>
                    )}
                    <Tooltip id="heatmap-tooltip" />
                </div>

                <div className={styles.divider}></div>

                {/* Footer: Centered Custom Legend */}
                <div className={styles.footer}>
                    <div className={styles.legend}>
                        <span className={styles.legendLabel}>Less</span>
                        <div className={styles.legendColors}>
                            <span style={{ background: '#e5e7eb' }}></span>
                            <span style={{ background: '#fde68a' }}></span>
                            <span style={{ background: '#fcd34d' }}></span>
                            <span style={{ background: '#fbbf24' }}></span>
                            <span style={{ background: '#f59e0b' }}></span>
                        </div>
                        <span className={styles.legendLabel}>More</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
