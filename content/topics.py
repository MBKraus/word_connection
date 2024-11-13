from openai import OpenAI
from pydantic import BaseModel, validator, conlist, Field
from typing import List, Dict, Optional
import joblib
import json

from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

class TopicGroup(BaseModel):
    topic: List[str]  # List with at least 1 word in `topic`
    words: List[str]  # Exactly 4 words in `words`

class Round(BaseModel):
    topics: List[TopicGroup]  # Exactly 3 topics per round

class DayEntry(BaseModel):
    rounds: List[Round] # Exactly 3 rounds per day entry

class DataModel(BaseModel):
    entries: Optional[Dict[str, DayEntry]] = Field(..., description="AI response for each day in the date range")

completion = client.beta.chat.completions.parse(
    # model="gpt-4o-mini",
    model="gpt-4o-2024-08-06",
    messages=[
        {"role": "system", "content": "You are a topic and describing entries generator."},
        {"role": "user", "content":
           "Generate output for a game where each day (with key YYYY-MM-DD) contains three game rounds,\n" 
           "and each round has three topics with four entries for each topic.\n"
           "A topic can only occur once across the entire set of days\n"
           "Topics for each day:\n"
           "- should be specific and well-defined. Avoid broad or generic topics (e.g., 'Sports', 'Nature', 'History').\n"
           "- should be distinct, and unique in their field.\n"
           "- should be highly familiar, simple, extremely everyday, and easy to guess from the entries and phrases provided"
           "- can contain multiple spelling variants e.g. 'color', 'colour' and 'The Louvre', 'Louvre', 'The Louvre Museum'.\n"
           "- if the topic is a person also include just their last name (e.g., 'Einstein', 'Tesla') in the topic.\n"
           "- only one topic per round can be a person.\n"
           "- only one topic per round can be an event.\n"
           "The goal is to create a detailed and unique list of topics that are concrete and easily identifiable, without overlapping too much with other topics.\n"
           "Ensure that each day's topics are diverse and from a variety of domains, such as:\n"
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
            "For each topic, provide 4 specific words or phrases related to that topic. There are a couple key rules with respect to these descriptive entries:\n"
            "- These words or phases should be closely related to the topic and help define it clearly.\n"
            "- In each round, a descriptive entry cannot repeat or include any part of the topic itself, \n"
            "nor be part of another descriptive entry in that round. For example, if the topic is 'Grammy Awards' \n"
            "using 'Awards' as a descriptive entry would not be allowed.\n"
            "- each descriptive entry should be 1–4 words long to allow multi-word terms like 'South America' or 'longest flow' to \n\n" 
            "remain as single entries without splitting them.\n"
            "- Avoid splitting entries if doing so would result in overly generic terms that lose specific meaning. \n"
            "Here are some example topics and entries for guidance:\n"
            "topic=[Michael Jordan], words=[Basketball, Chicago Bulls, Air, 23]\n"
            "topic=['The Titanic', 'Titanic'], words=['Sinking', 'Iceberg', 'Luxury', '1912']\n"
            "topic=[Mars], words=[Space, Red planet, Rover, Fourth from the Sun]\n"
            "topic=[Fruits], words=[Apple, Banana, Cherry, Berry]\n"
            "topic=['Charles Darwin', 'Darwin'], words=['Evolution', 'Natural Selection', 'Galapagos', 'Biologist']\n"
            "topic=[Countries], words=[Brazil, Canada, Denmark, Egypt]\n"
            "topic=['Cryptocurrencies', 'Crypto', 'Cryptos'], words=['Bitcoin', 'Altcoin', 'Blockchain', 'Investing']\n\n"
            "Generate output for the date range from 2024-11-01 to 2024-11-30.\n"
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
with open("raw.json", "w") as f:
    json.dump(data_dict, f, indent=4) 