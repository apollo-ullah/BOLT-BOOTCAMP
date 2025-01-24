import pandas as pd
from sqlalchemy import create_engine, text
import os


def import_data():
    """Import data from CSV files into the database"""
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")

    print("Importing data...")

    # Get the absolute path to the backend directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)

    # Import consultants
    try:
        consultants_path = os.path.join(backend_dir, "consultants.csv")
        print(f"Looking for consultants file at: {consultants_path}")
        consultants_df = pd.read_csv(consultants_path)
        consultants_df.to_sql("consultants", engine, if_exists="append", index=False)
        print("Consultants data imported successfully!")
    except Exception as e:
        print(f"Error importing consultants: {e}")

    # Import projects
    try:
        projects_path = os.path.join(backend_dir, "projects_fixed.csv")
        print(f"Looking for projects file at: {projects_path}")
        projects_df = pd.read_csv(projects_path)
        # Clean column names
        projects_df.columns = projects_df.columns.str.strip()
        # Rename columns to match table schema
        projects_df = projects_df.rename(
            columns={"Location": "location_city", "Description": "description"}
        )
        projects_df.to_sql("projects", engine, if_exists="append", index=False)
        print("Projects data imported successfully!")
    except Exception as e:
        print(f"Error importing projects: {e}")

    # Print current counts
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM consultants"))
        consultant_count = result.scalar()

        result = conn.execute(text("SELECT COUNT(*) FROM projects"))
        project_count = result.scalar()

        print(f"\nCurrent data in database:")
        print(f"Consultants: {consultant_count}")
        print(f"Projects: {project_count}")


if __name__ == "__main__":
    import_data()
