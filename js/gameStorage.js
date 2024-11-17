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

    static recordGamePlayed() {
        try {
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

const LAST_PLAYED_KEY = 'wordconnect_last_played';

export async function saveGameStats(score, totalTopicsGuessed) {
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

export async function getGameStats(userId) {
    await initializeDb();
    const stats = {
        totalGamesPlayed: 0,
        lastPlayed: null,
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

export async function hasPlayedTodayDB(userId) {
    await initializeDb();
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const statsRef = doc(db, 'gameStats', userId, 'dailyStats', today);
        const statsDoc = await getDoc(statsRef);
        console.log(userId)
        return statsDoc.exists();
    } catch (error) {
        console.error('Error checking if user played today:', error);
        return false;
    }
}