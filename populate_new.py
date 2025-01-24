import pandas as pd


def load_data(connection):
    """Load and format data from CSV files into database"""
    try:
        # Read CSV files
        projects_df = pd.read_csv("projects_fixed.csv")

        # Print column names for debugging
        print("\nColumn names in CSV:")
        print(projects_df.columns.tolist())

        # Clean column names by removing tabs
        projects_df.columns = projects_df.columns.str.strip()
        print("\nCleaned column names:")
        print(projects_df.columns.tolist())

        # Convert dates
        projects_df["start_date"] = pd.to_datetime(projects_df["start_date"])
        projects_df["end_date"] = pd.to_datetime(projects_df["end_date"])

        # Adjust dates (75% to 2025)
        projects_df = adjust_project_dates(projects_df)

        # Format locations
        locations = projects_df["Location"].apply(format_location)
        projects_df["location_city"] = locations.apply(lambda x: x[0])
        projects_df["location_country"] = locations.apply(lambda x: x[1])

        # ... existing code ...
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

    return projects_df


def adjust_project_dates(projects_df):
    # Implementation of adjust_project_dates function
    pass


def format_location(location):
    # Implementation of format_location function
    pass


def adjust_project_dates(projects_df):
    # Implementation of adjust_project_dates function
    pass


def format_location(location):
    # Implementation of format_location function
    pass
