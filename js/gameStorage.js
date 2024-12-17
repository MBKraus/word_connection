import { getFirestore, increment, doc, setDoc, serverTimestamp, collection, getDocs, limit, orderBy, query, getDoc, getAggregateFromServer, average } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { getFirebaseApp } from './firebaseInit.js';

const LAST_PLAYED_KEY = 'wordconnect_last_played';
let db = null;
let gameStatsPromise = null;
export let currentUser = null;  // You'll need to keep track of the current user

// Initialize DB connection
async function initializeDb() {
    if (!db) {
        const app = await getFirebaseApp();
        db = getFirestore(app);
    }
    return db;
}

// Fetch game stats for the current user along a promise
async function initializeStats(user) {
    if (user) {
        gameStatsPromise = fetchGameStats(user.uid);
        return gameStatsPromise;
    }
    return null;
}

// Get cached stats or fetch them if not available
export async function getCachedOrFetchGameStats() {
    if (!currentUser) {
        return null;
    }
    if (!gameStatsPromise) {
        console.log('No existing stats promise, creating new one');
        gameStatsPromise = initializeStats(currentUser);
    }
    try {
        const stats = await gameStatsPromise;
        return stats;
    } catch (error) {
        console.error('Error loading stats:', error);
        return null;
    }
}

// Update the current user and initialize stats (used on login)
export function updateUserAndInitializeStats(user) {
    currentUser = user;
    if (user) {
        initializeStats(user);
    } else {
        gameStatsPromise = null;
    }
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

    static storePlayedTodayCookie() {
        // Store last_played_key locally
        try {
            localStorage.setItem(LAST_PLAYED_KEY, new Date().toISOString());
        } catch (error) {
            console.error('Error recording game played:', error);
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
}

export async function writeGameStats(score, totalTopicsGuessed) {
    if (!window.auth.currentUser) {
        console.log('User not logged in - stats not saved');
        return;
    }

    await initializeDb();
    const userId = window.auth.currentUser.uid;
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

async function checkGuessedAllYesterday(userId, formattedYesterday) {
    let guessedAllYesterday = false;

    try {
        const yesterdayStatsRef = doc(db, 'gameStats', userId, 'dailyStats', formattedYesterday);
        const yesterdaySnap = await getDoc(yesterdayStatsRef);

        if (yesterdaySnap.exists()) {
            const yesterdayData = yesterdaySnap.data();
            guessedAllYesterday = yesterdayData.totalTopicsGuessed === 6;
            console.log('Guessed all yesterday:', guessedAllYesterday);
        }
    } catch (error) {
        console.error('Error fetching yesterday\'s stats:', error);
    }

    return guessedAllYesterday;
}

async function updateStreak(userId, todayDate, totalTopicsGuessed) {
    await initializeDb();

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let currentStreak = null;
    let longestStreak = null;
    let lastPlayedDate = null;

    if (userSnap.exists()) {
        const userData = userSnap.data();
        currentStreak = userData.currentStreak || 0;
        longestStreak = userData.longestStreak || 0;
        lastPlayedDate = userData.lastPlayed
            ? userData.lastPlayed.toDate().toISOString().split('T')[0]
            : null;
    }

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    // Check if the user guessed all 6 topics yesterday
    const guessedAllYesterday = await checkGuessedAllYesterday(userId, formattedYesterday);

    // Update streak logic: only increment if guessed all 6 today and yesterday
    if (totalTopicsGuessed === 6) {
        if (guessedAllYesterday) {
            currentStreak += 1;
        } else {
            currentStreak = 1; // Reset streak since yesterday wasn't perfect
        }
    } else {
        currentStreak = 0; // Reset streak if today wasn't perfect
    }

    // Update longest streak
    longestStreak = Math.max(longestStreak, currentStreak);

    // Save updated streak information back to Firestore
    try {
        await setDoc(userRef, {
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            lastPlayed: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating streak:', error);
    }
}