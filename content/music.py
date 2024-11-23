from openai import OpenAI
from pydantic import BaseModel, validator, conlist, Field
from typing import List, Dict, Optional
import joblib
import json
from pydantic import ValidationError

from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

class DataModel(BaseModel):
    topics: Optional[List[Dict[str, list[str]]]] = Field(..., description="AI response")

completion = client.beta.chat.completions.parse(
    # model="gpt-4o-mini",
    model="gpt-4o-2024-08-06",
    messages=[
{
  "role": "system",
  "content": "You are an expert topic and descriptive entry generator."
},
{
  "role": "user",
  "content": 
    "Generate unique topics, each with four specific descriptive entries.\n\n"
    "### Requirements for Topics:\n"
    "- A topic should be a well-known, easy to guess for an average joe, music band or singer that comes to mind instantly (e.g., 'The Beatles,' 'Beyoncé').\n"
    "- Topics must be unique and distinct, occurring only once in all generated topics.\n"
    "- Topics should be familiar, concrete, and easy to recognize based on the entries provided.\n"
    "- if the topic is a singer also include just his / her last name (e.g., 'Swift', 'Jagger') in the topic variants.\n"
    "- Topics must include at least 2 **spelling variants, synonyms, or simplified forms**. This is a key rule. Here are a couple examples: \n"
    "  - 'Printing Press', 'Gutenberg Press'\n"
    "  - 'Light Bulb', 'Electric Lamp'\n"
    "### Requirements for Descriptive Entries:\n"
    "- Provide exactly 4 descriptive words or phrases for each topic.\n"
    "- Entries must be specific, clearly related to the topic, and collectively help define it.\n"
    "- Entries cannot repeat any part of the topic itself or overlap with each other within the same topic.\n"
    "- Keep entries concise: 1–4 words long. Multi-word phrases (e.g., 'South America') are allowed if they provide meaningful specificity.\n"
    "- Avoid splitting entries into overly generic terms that lose clarity (e.g., 'Luxury ship' is better than splitting into 'Luxury' and 'Ship').\n\n"
    "### Example Topics and Entries:\n"
    "- **Topic:** ['Printing Press', 'Gutenberg Press', 'Movable Type Printing']\n"
    "  **Entries:** ['Johannes Gutenberg', 'Typefaces', 'Books', 'Mass Production']\n"
    "- **Topic:** '['Light Bulb', 'Electric Lamp', 'Incandescent Lamp']\n"
    "  **Entries:** ['Thomas Edison', 'Filament', 'Electric Current', 'Illumination']\n\n"
    "### Output Format:\n"
    "- Provide results in this format: `[{topic: [variant A of topic 1, variant B of topic 2], entries: [entry 1, entry 2, entry 3, entry 4]}]`.\n\n"
    "- Generate 50 topics with 4 descriptive entries each, ensuring no overlap between topics or their descriptive entries.\n"
    }
    ],
    response_format=DataModel,
)

data_parsed = completion.choices[0].message.parsed

print(type(data_parsed))
print(data_parsed)
json_data = data_parsed.json()
data_dict = json.loads(json_data)

# Write to file with pretty formatting
with open("./data/music.json", "w") as f:
    json.dump(data_dict, f, indent=4) 

# # Load the data back from the JSON file
# with open("raw_data.json", "r") as f:
#     loaded_data = json.load(f)

# # Re-create the DataModel instance from the loaded data
# try:
#     reloaded_data_model = DataModel(**loaded_data)
#     print("Data loaded successfully into DataModel:")
#     print(reloaded_data_model)
# except ValidationError as e:
#     print("Validation Error:", e.json())