import Link from 'next/link';
import styles from './NavigationSidebar.module.css';

export default function NavigationSidebar({
    isOpen,
    onClose,
    searchQuery,
    onSearch,
    onDailyWallClick,
    onCalendarClick,
    onHallOfFameClick,
    onThemeToggle,
    theme
}) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`${styles.sidebarContainer} ${isOpen ? styles.open : ''}`}>
                {/* Zone A: Global Search */}
                <div className={styles.zoneSearch}>
                    <span className={styles.label}>Search</span>
                    <div className={styles.searchInputWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search your wins..."
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                {/* Zone B: Navigation */}
                <nav className={styles.zoneNav}>
                    <span className={styles.label}>Navigation</span>
                    <button className={styles.navButton} onClick={onDailyWallClick}>
                        <span className={styles.navIcon}>🏠</span>
                        Daily Wall
                    </button>
                    <button className={styles.navButton} onClick={onCalendarClick}>
                        <span className={styles.navIcon}>📅</span>
                        Calendar
                    </button>
                    <Link href="/hall-of-fame" style={{ textDecoration: 'none' }}>
                        <button className={styles.navButton} onClick={onClose}>
                            <span className={styles.navIcon}>🏆</span>
                            Hall of Fame
                        </button>
                    </Link>
                </nav>

                {/* Zone C: Footer */}
                <div className={styles.zoneFooter}>
                    <div className={styles.footerRow}>
                        <button
                            className={styles.themeToggle}
                            onClick={onThemeToggle}
                            title="Toggle Theme"
                        >
                            {theme === 'auto' ? '🌗' : (theme === 'light' ? '☀️' : '🌙')}
                        </button>
                        <Link href="/settings" style={{ textDecoration: 'none' }}>
                            <button className={styles.settingsButton}>
                                ⚙️ Settings
                            </button>
                        </Link>
                    </div>
                    <div className={styles.version}>v1.0</div>
                </div>
            </aside>
        </>
    );
}
