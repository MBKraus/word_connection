import json
import os

# List of areas corresponding to JSON filenames
# Optional: art, fashion, mythology, nature
areas = [
    'things'
]

# Directory containing JSON files
data_directory = "content/data/all"

# Load topics from files into a dictionary
area_topics = {}
for area in areas:
    file_path = os.path.join(data_directory, f"{area}.json")
    if os.path.exists(file_path):  # Check if the file exists
        with open(file_path, "r") as f:
            # Load topics from the JSON file
            topics = json.load(f).get("topics", [])
            print(f"Number of topics: {len(topics)}")
            for topic in topics:
                print(topic["topic"][0])