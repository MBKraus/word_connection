import json
from topics import DataModel
from pydantic import ValidationError

# Load the data back from the JSON file
with open("raw_data.json", "r") as f:
    loaded_data = json.load(f)

# Re-create the DataModel instance from the loaded data
try:
    reloaded_data_model = DataModel(**loaded_data)
    print("Data loaded successfully into DataModel:")
    print(reloaded_data_model)
except ValidationError as e:
    print("Validation Error:", e.json())