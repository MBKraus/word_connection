export function loadTopics(scene) {
    const data = scene.cache.text.get('data');      // Retrieve cached text
    const jsonString = atob(data);                  // Decode from base64
    const allTopics = JSON.parse(jsonString);       // Parse JSON
    return allTopics;
}

// Function to generate rounds without repeating topics in the same round
export function generateRounds(allTopics, numberOfRounds, topicsPerRound) {
    let availableTopics = [...allTopics];

    return Array(numberOfRounds).fill(null).map(() => {
        // Ensure there are enough topics available
        if (availableTopics.length < topicsPerRound) {
            // Replenish the available topics (resetting the pool) if there are not enough remaining
            availableTopics = [...allTopics];
        }

        const roundTopics = sampleTopics(availableTopics, topicsPerRound);

        // Remove the topics that were used in this round
        availableTopics = availableTopics.filter(topic => !roundTopics.includes(topic));

        return roundTopics;
    });
}

function sampleTopics(allTopics, count) {
    if (!Array.isArray(allTopics) || allTopics.length < count) {
        console.error('Invalid topics array or not enough topics');
        return [];
    }
    
    // Shuffle topics
    let topics = [...allTopics];
    for (let i = topics.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topics[i], topics[j]] = [topics[j], topics[i]];
    }

    // Return the first `count` topics
    return topics.slice(0, count);
}