// gameStorage.js

import { getFirestore, increment, doc, setDoc, serverTimestamp, collection, getDocs, limit, orderBy, query, getDoc} from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js';
import { auth } from './auth.js';

const db = getFirestore();

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

export async function saveGameStats(score, totalTopicsGuessed) {
    // Only save stats if user is logged in
    if (!auth.currentUser) {
        console.log('User not logged in - stats not saved');
        return;
    }

    const userId = auth.currentUser.uid;
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    try {
        // Create a document reference with user ID and date
        const statsRef = doc(db, 'gameStats', userId, 'dailyStats', dateString);
        
        // Save the game statistics
        await setDoc(statsRef, {
            score: score,
            totalTopicsGuessed: totalTopicsGuessed, // Changed from topicsGuessed to totalTopicsGuessed
            timestamp: serverTimestamp(),
            date: dateString
        });

        console.log('Game stats saved successfully');
    } catch (error) {
        console.error('Error saving game stats:', error);
    }
}

export async function updateUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            totalGamesPlayed: increment(1),
            lastPlayed: serverTimestamp()
        }, { merge: true });
        console.log('User profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
}

export async function getGameStats(userId) {
    const stats = {
        totalGamesPlayed: 0,
        lastPlayed: null,
        recentSessions: []
    };

    try {
        // Get user profile information
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            stats.totalGamesPlayed = userSnap.data().totalGamesPlayed || 0;
            stats.lastPlayed = userSnap.data().lastPlayed ? userSnap.data().lastPlayed.toDate() : null;
        }

        // Get last 3 sessions
        const sessionsRef = collection(db, 'gameStats', userId, 'dailyStats');
        const sessionsQuery = query(sessionsRef, orderBy('timestamp', 'desc'), limit(3));
        const sessionDocs = await getDocs(sessionsQuery);

        sessionDocs.forEach(doc => {
            const data = doc.data();
            stats.recentSessions.push({
                date: data.date,
                totalTopicsGuessed: data.totalTopicsGuessed
            });
        });

        return stats;
    } catch (error) {
        console.error('Error retrieving game stats:', error);
        return null;
    }
}