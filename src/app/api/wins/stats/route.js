import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const stmt = db.prepare('SELECT date_created FROM wins ORDER BY date_created DESC');
        const wins = stmt.all();

        if (wins.length === 0) {
            return NextResponse.json({ currentStreak: 0, bestStreak: 0, totalWins: 0 });
        }

        const dates = wins.map(w => w.date_created);
        const uniqueDates = [...new Set(dates)];
        const totalWins = wins.length;

        // Current Streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // Check if today or yesterday has a win to start the streak
        if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
            // Iterate backwards from today/yesterday
            // To simplify, let's just find the most recent consecutive block ending at today or yesterday

            // Sort DESC (most recent first)
            uniqueDates.sort((a, b) => new Date(b) - new Date(a));

            // If the most recent date is neither today nor yesterday, streak is broken -> 0
            const mostRecent = uniqueDates[0];
            if (mostRecent === today || mostRecent === yesterday) {
                currentStreak = 1;
                let currentDate = new Date(mostRecent);

                for (let i = 1; i < uniqueDates.length; i++) {
                    const prevDate = new Date(currentDate);
                    prevDate.setDate(prevDate.getDate() - 1);
                    const prevDateString = prevDate.toISOString().split('T')[0];

                    if (uniqueDates[i] === prevDateString) {
                        currentStreak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // Best Streak
        let bestStreak = 0;
        let tempStreak = 0;
        // Sort dates ASC for this calculation
        const sortedDatesAsc = [...uniqueDates].sort((a, b) => new Date(a) - new Date(b));

        if (sortedDatesAsc.length > 0) {
            tempStreak = 1;
            bestStreak = 1;
            let prevDate = new Date(sortedDatesAsc[0]);

            for (let i = 1; i < sortedDatesAsc.length; i++) {
                const currDate = new Date(sortedDatesAsc[i]);
                const diffTime = Math.abs(currDate - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }

                if (tempStreak > bestStreak) {
                    bestStreak = tempStreak;
                }
                prevDate = currDate;
            }
        }


        return NextResponse.json({ currentStreak, bestStreak, totalWins });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
