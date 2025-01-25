import pandas as pd
import random
from datetime import datetime, timedelta

# Read the CSV file
df = pd.read_csv('data/consultants_fixed.csv')

# Calculate number of consultants to update (80%)
num_consultants = len(df)
num_to_update = int(num_consultants * 0.8)

# Create a list of indices to update (randomly selected)
indices_to_update = random.sample(range(num_consultants), num_to_update)

# Set the availability period
availability = "2025-01-01 to 2025-11-01"

# Update the availability for selected consultants
df.loc[indices_to_update, 'current_availability'] = availability

# Save the updated CSV
df.to_csv('data/consultants_fixed.csv', index=False)

print(f"Updated availability for {num_to_update} consultants to {availability}") 