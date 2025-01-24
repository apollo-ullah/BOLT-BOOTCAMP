import pandas as pd
import psycopg2
from datetime import datetime
import json
from sqlalchemy import create_engine


def connect_to_db():
    """Create database connection"""
    try:
        connection = psycopg2.connect(
            database="consultant_matcher",
            user="postgres",
            password="aullah6",  # Change this
            host="localhost",
            port="5432",
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


def create_tables(connection):
    """Create necessary tables if they don't exist"""
    try:
        cursor = connection.cursor()

        # Create consultants table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS consultants (
                id INTEGER PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(100),
                gender VARCHAR(50),
                seniority_level VARCHAR(50),
                skill1 VARCHAR(100),
                skill2 VARCHAR(100),
                skill3 VARCHAR(100),
                years_of_experience INTEGER,
                current_availability VARCHAR(100),
                location_flexibility VARCHAR(100),
                preferred_industries VARCHAR(100),
                certifications VARCHAR(200),
                hobbies VARCHAR(100),
                ethnic VARCHAR(100),
                past_project_industry VARCHAR(100),
                profile_picture VARCHAR(200)
            )
        """
        )

        # Create projects table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                project_name VARCHAR(200),
                preferred_industry VARCHAR(100),
                start_date DATE,
                end_date DATE,
                location VARCHAR(100),
                difficulty VARCHAR(50),
                description TEXT,
                required_skill1 VARCHAR(100),
                required_skill2 VARCHAR(100),
                required_skill3 VARCHAR(100)
            )
        """
        )

        connection.commit()
        print("Tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")
        connection.rollback()


def load_data(connection):
    """Load data from CSV files into database"""
    try:
        # Read fixed CSV files
        consultants_df = pd.read_csv("backend/consultants_fixed.csv")
        projects_df = pd.read_csv("backend/projects_fixed.csv")
        pfp_df = pd.read_csv("backend/pfp.csv")

        # Add profile pictures to consultants
        consultants_df["profile_picture"] = pfp_df["pfp"]

        # Convert dates to datetime
        projects_df["start_date"] = pd.to_datetime(projects_df["start_date"])
        projects_df["end_date"] = pd.to_datetime(projects_df["end_date"])

        # Create SQLAlchemy engine
        engine = create_engine(
            "postgresql://postgres:aullah6@localhost:5432/consultant_matcher"
        )

        # Load data into database
        consultants_df.to_sql("consultants", engine, if_exists="replace", index=False)
        projects_df.to_sql("projects", engine, if_exists="replace", index=False)
        print("Data loaded successfully")

    except Exception as e:
        print(f"Error loading data: {e}")
        import traceback

        print(traceback.format_exc())


def main():
    # Connect to database
    connection = connect_to_db()
    if connection is None:
        return

    # Create tables
    create_tables(connection)

    # Load data
    load_data(connection)

    # Close connection
    connection.close()


if __name__ == "__main__":
    main()
