// gameStorage.js

const LAST_PLAYED_KEY = 'wordconnect_last_played';

export class GameStorage {
    static hasPlayedToday() {
        try {
            const lastPlayedTime = localStorage.getItem(LAST_PLAYED_KEY);

            console.log('Last played time:', lastPlayedTime);
            
            // If no timestamp exists, they haven't played
            if (!lastPlayedTime) return false;
            
            // Compare the stored date with today's date
            const lastPlayed = new Date(lastPlayedTime);
            const today = new Date();
            
            return lastPlayed.toDateString() === today.toDateString();
        } catch (error) {
            console.error('Error checking last played time:', error);
            return false; // If there's an error, let them play
        }
    }

    static recordGamePlayed() {
        try {
            // Store current timestamp
            localStorage.setItem(LAST_PLAYED_KEY, new Date().toISOString());
        } catch (error) {
            console.error('Error recording game played:', error);
        }
    }

    static getNextPlayTime() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }
}