
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './StickyNote.module.css';

export default function StickyNote({ win, onToggleStar, onDelete, onUpdate }) {
    // Random slight rotation for that "sticky note" feel
    // Use a ref or state to keep the rotation stable across re-renders
    const [rotation, setRotation] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(win.content);
    const textAreaRef = useRef(null);

    useEffect(() => {
        setRotation(Math.floor(Math.random() * 6) - 3);
    }, []);

    useEffect(() => {
        if (isEditing && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (editText.trim() !== win.content) {
            onUpdate(win.id, editText);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditText(win.content); // revert
        }
    };

    const isPolaroid = Boolean(win.image_url);

    return (
        <div
            className={`${styles.note} ${isPolaroid ? styles.polaroid : styles[win.color || 'yellow']}`}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <button
                className={styles.deleteBtn}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(win.id);
                }}
                aria-label="Delete win"
            >
                ✕
            </button>

            {isPolaroid ? (
                <>
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={win.image_url}
                        alt="Win"
                        className={styles.polaroidImage}
                    />

                    {/* Caption (Editable) */}
                    {isEditing ? (
                        <textarea
                            ref={textAreaRef}
                            className={styles.textArea}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            style={{ textAlign: 'center', minHeight: '60px' }}
                        />
                    ) : (
                        <div
                            className={styles.polaroidCaption}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit caption"
                        >
                            {win.content}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {isEditing ? (
                        <textarea
                            ref={textAreaRef}
                            className={styles.textArea}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <div
                            className={styles.content}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit"
                        >
                            {win.content}
                        </div>
                    )}
                </>
            )}

            {/* Optional Date Display for Search Results */}
            {win.date_created && (
                <div className={styles.dateDisplay} style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginTop: '4px',
                    textAlign: 'right',
                    width: '100%',
                    fontFamily: 'var(--font-nunito)'
                }}>
                    {new Date(win.date_created).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            )}

            <div className={styles.controls} style={isPolaroid ? { width: '100%', marginTop: 'auto' } : {}}>
                {/* Spacer if needed or just align right */}
                <div />
                <button
                    className={`${styles.starBtn} ${win.is_starred ? styles.isStarred : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(win.id);
                    }}
                    aria-label={win.is_starred ? "Unstar this win" : "Star this win"}
                >
                    ★
                </button>
            </div>
        </div>
    );
}
