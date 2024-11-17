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
    topics: Optional[List[List[str]]] = Field(..., description="AI generated list of lists of topics")

completion = client.beta.chat.completions.parse(
    # model="gpt-4o-mini",
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a topic and generator."},
        {"role": "user", "content":
           "Generate 150 topics. The output should be a list of lists. Each sub-list covers a topic.\n"
           "A sub-list covering a topic can contain multiple spelling variants e.g. 'color', 'colour' and 'The Louvre', 'Louvre', 'The Louvre Museum'\n"
           "A topic can only occur once in all the topics you generate.\n"
           "A topic should be:\n"
           "- should be specific and well-defined. Avoid broad or generic topics (e.g., 'Sports', 'Nature', 'History').\n"
           "- should be distinct, and unique in its field.\n"
           "- should be highly familiar, simple, extremely everyday, and easy to guess"
           "- ensure the topic is relative simple to spell and does not cover more than 3 words.\n"
           "- if the topic is a person also include just their last name (e.g., 'Einstein', 'Tesla') in the topic.\n"
           "The goal is to create a detailed and unique set of topics that are concrete and easily identifiable, without overlapping too much with other topics.\n"
           "Ensure that topics are diverse and from a variety of domains, such as:\n"
            "- Specific people or famous personalities (e.g., 'Michael Jordan', 'Leonardo da Vinci')\n"
            "- Specific places (e.g., 'Paris', 'Great Wall of China')\n"
            "- Specific items or things (e.g., 'Electric Cars', 'Smartphones', 'Guitars', 'Fruits')\n"
            "- Specific events (e.g., 'Olympics', 'Super Bowl', 'World War II')\n"
            "- Well-Known Films or Series (e.g. the Godfather)\n"
            "- Famous Books or Literary Works (e.g., 'Mona Lisa,' 'Statue of Liberty)\n"
            "- Important Discoveries or Inventions (e.g., 'Penicillin', 'Theory of Relativity')\n"
            "- Major Organizations or Institutions (e.g., 'United Nations', 'NASA'\n"
            "- Mythology and Legends (e.g., Greek Gods, Excalibur, Trojan Horse)\n"
            "- Cuisine and Dishes (e.g., Sushi, Pizza, Tacos, Dim Sum)\n"
            "- Popular Animals (e.g., Dolphins, Lions, Pandas, Elephants)\n"
            "- Specific Sports or Games (e.g., 'Basketball', 'Chess')\n"
            "- Specific Music Genres or Bands (e.g., 'Rock Music', 'The Beatles')\n"
            "- Musical Instruments (e.g., Piano, Guitar)\n"
            "- Climate or Weather Phenomena (e.g., Hurricane, Tornado)\n"
            "- Common Hobbies or Sports (e.g., Chess, Knitting, Soccer, Rock Climbing)\n"
            "Please source from these domains and other domains you think might suit well, but ensure the topics are specific and distinct.\n\n"
        }
    ],
    response_format=DataModel,
)

data_parsed = completion.choices[0].message.parsed

print(type(data_parsed))
print(data_parsed)
json_data = data_parsed.json()
data_dict = json.loads(json_data)

# # Write to file with pretty formatting
# with open("raw.json", "w") as f:
#     json.dump(data_dict, f, indent=4) 

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