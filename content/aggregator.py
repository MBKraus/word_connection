import json
import os

# List of areas corresponding to JSON filenames
# Optional: art, fashion, mythology, nature
areas = [
    'films_series_art', 
    'music_and_instruments', 'nature_and_space', 
    'persons_and_organizations', 'places_events', 'sports_games_hobbies_cuisine', 'things_and_inventions'
]

# Directory containing JSON files
data_directory = "content/data/easy"

# Load topics from files into a dictionary
area_topics = {}
for area in areas:
    file_path = os.path.join(data_directory, f"{area}.json")
    if os.path.exists(file_path):  # Check if the file exists
        with open(file_path, "r") as f:
            try:
                # Load topics from the JSON file
                topics = json.load(f).get("topics", [])
                area_topics[area] = {"topics": topics}
            except json.JSONDecodeError:
                print(f"Error decoding JSON in file: {file_path}")
    else:
        print(f"File not found: {file_path}")

# Save the aggregated data into a single JSON file
output_file = "content/aggregated_topics.json"
with open(output_file, "w") as f:
    json.dump(area_topics, f, indent=4)

print(f"Aggregated topics saved to {output_file}")