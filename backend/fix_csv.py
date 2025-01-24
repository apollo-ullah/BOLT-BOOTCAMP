import pandas as pd
from datetime import datetime, timedelta
import random


def random_date(start, end):
    """Generate a random date between start and end"""
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)


def fix_consultants_csv():
    """Fix the consultants.csv file by replacing date placeholders"""
    try:
        # Load consultants CSV
        consultants = pd.read_csv("backend/consultants.csv")

        # Set date range for availability
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2025, 1, 1)

        # Generate realistic date ranges for availability
        def generate_date_range():
            start = random_date(start_date, end_date)
            end = start + timedelta(days=90)  # 3-month availability window
            return f"{start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}"

        # Replace placeholder dates with actual dates
        consultants["current_availability"] = [
            generate_date_range() for _ in range(len(consultants))
        ]

        # Save the fixed CSV
        consultants.to_csv("backend/consultants_fixed.csv", index=False)
        print("Consultants CSV fixed!")
    except Exception as e:
        print(f"Error fixing consultants CSV: {e}")


def fix_projects_csv():
    """Fix the projects.csv file by standardizing date formats"""
    try:
        # Load projects CSV
        projects = pd.read_csv("backend/projects.csv")

        # Print column names to debug
        print("Original column names:", projects.columns.tolist())

        # Ensure column names match our database schema
        column_mapping = {
            "Start_Date": "start_date",
            "End_Date": "end_date",
            "Project_Name": "project_name",
            "Preferred_Industry": "preferred_industry",
            "Location": "location",
            "Difficulty": "difficulty",
            "Description": "description",
            "Required_Skill1": "required_skill1",
            "Required_Skill2": "required_skill2",
            "Required_Skill3": "required_skill3",
        }

        # Rename columns if needed
        projects = projects.rename(columns=column_mapping)

        # Convert dates to standard format
        projects["start_date"] = pd.to_datetime(projects["start_date"]).dt.strftime(
            "%Y-%m-%d"
        )
        projects["end_date"] = pd.to_datetime(projects["end_date"]).dt.strftime(
            "%Y-%m-%d"
        )

        # Print sample of dates after conversion
        print("\nSample of converted dates:")
        print(projects[["start_date", "end_date"]].head())

        # Save the fixed CSV
        projects.to_csv("backend/projects_fixed.csv", index=False)
        print("Projects CSV fixed!")
    except Exception as e:
        print(f"Error fixing projects CSV: {e}")
        import traceback

        print(traceback.format_exc())


if __name__ == "__main__":
    print("Starting CSV fixes...")
    fix_consultants_csv()
    fix_projects_csv()
    print("CSV fixes completed!")
