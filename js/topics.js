export function loadTopics(scene) {
    const data = scene.cache.text.get('data');     // Retrieve cached text
    const jsonString = atob(data);                 // Decode from base64
    const allTopics = JSON.parse(jsonString); // Parse JSON
    return allTopics;
}