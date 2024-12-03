// gameStorage.js

import { getFirestore, increment, doc, setDoc, serverTimestamp, collection, getDocs, limit, orderBy, query, getDoc, getAggregateFromServer, average } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { auth } from './auth.js';
import { getFirebaseApp } from './firebaseInit.js';

let db = null;

async function initializeDb() {
    if (!db) {
        const app = await getFirebaseApp();
        db = getFirestore(app);
    }
    return db;
}

export class GameStorage {
    static hasPlayedTodayCookie() {
        // Check if 'last played time' cookie exists and if it does
        // return True if it equals today's date
        try {
            const lastPlayedTime = localStorage.getItem(LAST_PLAYED_KEY);
            if (!lastPlayedTime) return false;
            const lastPlayed = new Date(lastPlayedTime);
            const today = new Date();
            return lastPlayed.toDateString() === today.toDateString();
        } catch (error) {
            console.error('Error checking last played time:', error);
            return false;
        }
    }

    static async hasPlayedTodayDB(userId) {
        // Check in Firebase DB if user has played today
        await initializeDb();
        const today = new Date().toISOString().split('T')[0];
        try {
            const statsRef = doc(db, 'gameStats', userId, 'dailyStats', today);
            const statsDoc = await getDoc(statsRef);
            return statsDoc.exists();
        } catch (error) {
            console.error('Error checking if user played today:', error);
            return false;
        }
    }

    static recordGamePlayedLocal() {
        // Store last_played_key locally
        try {
            localStorage.setItem(LAST_PLAYED_KEY, new Date().toISOString());
        } catch (error) {
            console.error('Error recording game played:', error);
        }
    }

    static getNextPlayTime() {
        // Get tomorrow's date at 00:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }
}

const LAST_PLAYED_KEY = 'wordconnect_last_played';

export async function writeGameStats(score, totalTopicsGuessed) {
    if (!auth.currentUser) {
        console.log('User not logged in - stats not saved');
        return;
    }

    await initializeDb();
    const userId = auth.currentUser.uid;
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    try {
        const statsRef = doc(db, 'gameStats', userId, 'dailyStats', dateString);
        await setDoc(statsRef, {
            score: score,
            totalTopicsGuessed: totalTopicsGuessed,
            timestamp: serverTimestamp(),
            date: dateString
        });

        await updateStreak(userId, dateString, totalTopicsGuessed);

        console.log('Game stats saved successfully');
    } catch (error) {
        console.error('Error saving game stats:', error);
    }
}

export async function updateUserProfile(userId) {
    await initializeDb();
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

export async function fetchGameStats(userId) {
    await initializeDb();
    const stats = {
        totalGamesPlayed: 0,
        lastPlayed: null,
        currentStreak: 0,
        longestStreak: 0,
        recentSessions: [],
        averageTopicsGuessed: 0,
        averageScore: 0
    };

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            stats.totalGamesPlayed = userSnap.data().totalGamesPlayed || 0;
            stats.lastPlayed = userSnap.data().lastPlayed ? userSnap.data().lastPlayed.toDate() : null;
            stats.currentStreak = userSnap.data().currentStreak || 0;
            stats.longestStreak = userSnap.data().longestStreak || 0;
        }

        // Get all game sessions to calculate averages
        const sessionsRef = collection(db, 'gameStats', userId, 'dailyStats');
        const sessionsSnap = await getDocs(sessionsRef);
        
        let totalScore = 0;
        let totalTopics = 0;
        let sessionCount = 0;

        sessionsSnap.forEach(doc => {
            const data = doc.data();
            totalScore += data.score || 0;
            totalTopics += data.totalTopicsGuessed || 0;
            sessionCount++;
        });

        // Calculate averages
        stats.averageScore = sessionCount > 0 ? (totalScore / sessionCount).toFixed(1) : '0.0';
        stats.averageTopicsGuessed = sessionCount > 0 ? (totalTopics / sessionCount).toFixed(1) : '0.0';

        // Get recent sessions
        const recentSessionsQuery = query(sessionsRef, orderBy('timestamp', 'desc'), limit(3));
        const recentDocs = await getDocs(recentSessionsQuery);

        recentDocs.forEach(doc => {
            const data = doc.data();
            stats.recentSessions.push({
                date: data.date,
                totalTopicsGuessed: data.totalTopicsGuessed,
                score: data.score
            });
        });

        return stats;
    } catch (error) {
        console.error('Error retrieving game stats:', error);
        return null;
    }
}

async function updateStreak(userId, todayDate, totalTopicsGuessed) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let currentStreak = 1;
    let longestStreak = 1;
    let lastPlayedDate = null;

    if (userSnap.exists()) {
        const userData = userSnap.data();
        currentStreak = userData.currentStreak || 0;
        longestStreak = userData.longestStreak || 0;
        lastPlayedDate = userData.lastPlayed ? userData.lastPlayed.toDate().toISOString().split('T')[0] : null;
    }

    // Check if played yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    // Update streak only if totalTopicsGuessed is 6
    if (totalTopicsGuessed === 6) {
        if (lastPlayedDate === formattedYesterday) {
            currentStreak += 1;
        } else  {
            currentStreak = 1; 
        }
    } else {
        currentStreak = 0; 
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // Update user profile with streak information
    try {
        await setDoc(userRef, {
            currentStreak: currentStreak,
            longestStreak: longestStreak,
        }, { merge: true });

        console.log('Streak updated successfully');
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}