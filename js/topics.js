import { gameConfig } from './config.js';

export function loadTopics(scene) {
    const data = scene.cache.text.get('data');     // Retrieve cached text
    const jsonString = atob(data);                 // Decode from base64
    const allTopics = JSON.parse(jsonString); // Parse JSON
    return allTopics;
}

export function generateGameRounds(aggregatedTopics) {
    // Load aggregated_topics.json

    // Extract areas and their topics
    const areas = Object.keys(aggregatedTopics);

    // Function to randomly sample a topic from an area
    function sampleTopic(area, usedTopics) {
        const topics = aggregatedTopics[area].topics;
        const availableTopics = topics.filter(topic => !usedTopics.has(topic.topic[0])); // Use first name as unique identifier
        if (availableTopics.length === 0) {
            throw new Error(`No available topics in area: ${area}`);
        }
        const randomIndex = Math.floor(Math.random() * availableTopics.length);
        return availableTopics[randomIndex];
    }

    // Generate two rounds
    const usedTopics = new Set();
    const rounds = [];

    for (let round = 0; round < gameConfig.rounds; round++) {
        const selectedAreas = [];
        const roundTopics = [];

        while (selectedAreas.length < gameConfig.topicsPerRound) {
            // Pick a random area that hasn't been used this round
            const remainingAreas = areas.filter(area => !selectedAreas.includes(area));
            const randomArea = remainingAreas[Math.floor(Math.random() * remainingAreas.length)];

            // Sample a topic from this area
            try {
                const topic = sampleTopic(randomArea, usedTopics);
                roundTopics.push({
                    topic: topic.topic,
                    entries: topic.entries
                });
                usedTopics.add(topic.topic[0]); // Mark topic as used
                selectedAreas.push(randomArea); // Mark area as used in this round
            } catch (error) {
                console.error(error.message);
            }
        }

        rounds.push(roundTopics);
    }
    return rounds;
}
