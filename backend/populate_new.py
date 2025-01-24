import pandas as pd
import psycopg2
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy import create_engine
import random


def connect_to_db():
    """Create database connection"""
    try:
        connection = psycopg2.connect(
            database="consultant_matcher",
            user="postgres",
            password="aullah6",
            host="localhost",
            port="5432",
        )
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


def format_location(location):
    """Format location to city and country"""
    eu_cities = {
        "Paris": "EU",
        "Berlin": "EU",
        "Rome": "EU",
        "Amsterdam": "EU",
        "Madrid": "EU",
        "Brussels": "EU",
        "Vienna": "EU",
        "Copenhagen": "EU",
        "Stockholm": "EU",
        "Dublin": "EU",
        "Lisbon": "EU",
        "Prague": "EU",
        "Warsaw": "EU",
        "Frankfurt": "EU",
    }

    other_cities = {
        "London": "UK",
        "New York": "USA",
        "Chicago": "USA",
        "San Francisco": "USA",
        "Boston": "USA",
        "Washington DC": "USA",
        "Austin": "USA",
        "Los Angeles": "USA",
        "Tokyo": "Japan",
        "Shanghai": "China",
        "Hong Kong": "PRC",
        "Singapore": "Singapore",
        "Dubai": "UAE",
        "Sydney": "Australia",
        "Melbourne": "Australia",
        "Toronto": "Canada",
        "Vancouver": "Canada",
        "Montreal": "Canada",
        "Mumbai": "India",
        "Cape Town": "South Africa",
        "Kuala Lumpur": "Malaysia",
        "Zurich": "Switzerland",
        "Jakarta": "Indonesia",
        "Bangkok": "Thailand",
        "Seoul": "South Korea",
        "Atlanta": "USA",
        "Bengaluru": "India",
        "Miami": "USA",
        "Seattle": "USA",
        "San Diego": "USA",
        "San Jose": "USA",
        "San Francisco": "USA",
        "San Mateo": "USA",
        "Santa Clara": "USA",
        "Santa Monica": "USA",
        "Santa Rosa": "USA",
        "Newark": "USA",
        "New Orleans": "USA",
    }

    city = location.strip()

    # Replace Onsite and Hybrid with Montreal, Canada
    if city in ["Onsite", "Hybrid"]:
        return "Montreal", "Canada"
    elif city in eu_cities:
        return city, "EU"
    elif city in other_cities:
        return city, other_cities[city]
    else:
        return city, "Other"


def get_improved_description(project_name, industry):
    """Generate improved project descriptions based on project name and industry"""
    if "CRM" in project_name:
        return f"Implementation of a modern CRM system for the {industry.lower()} sector, including data migration, workflow automation, and integration with existing systems. The project focuses on improving customer engagement metrics through AI-powered insights and establishing a 360-degree view of customer interactions across all touchpoints."

    elif "Infrastructure" in project_name:
        return f"Comprehensive modernization of {industry.lower()} infrastructure through cloud migration, security hardening, and implementation of DevOps practices. This transformation will reduce operational costs by 40% while improving system reliability and enabling rapid scaling to meet business demands."

    elif "Analytics" in project_name:
        return f"Development of a cutting-edge analytics platform for {industry.lower()}, featuring real-time data processing, predictive modeling, and interactive visualization dashboards. The solution will enable data-driven decision making by integrating multiple data sources and providing actionable insights through machine learning algorithms."

    elif "Digital" in project_name:
        return f"End-to-end digital transformation initiative in {industry.lower()}, focusing on modernizing legacy systems and implementing automated workflows. The project aims to enhance customer experience and operational efficiency through paperless processes, mobile-first solutions, and integrated digital channels."

    elif "Platform" in project_name:
        return f"Design and implementation of a scalable {industry.lower()} platform that streamlines operations and enhances collaboration across departments. The platform will feature microservices architecture, real-time analytics, and API-first design to ensure seamless integration with third-party systems and future scalability."

    elif "System" in project_name:
        return f"Implementation of a new enterprise system for {industry.lower()}, encompassing requirements gathering, custom development, and comprehensive testing phases. The solution will modernize business processes through automation, improve data accuracy, and provide real-time reporting capabilities for better decision-making."

    elif "Optimization" in project_name:
        return f"Process optimization initiative in {industry.lower()} focusing on identifying and eliminating inefficiencies through data analysis and lean methodology implementation. The project will implement automated workflows, optimize resource allocation, and establish KPI monitoring systems to achieve a 30% improvement in operational efficiency."

    elif "Risk" in project_name:
        return f"Implementation of an advanced risk assessment and management system for {industry.lower()}, incorporating real-time monitoring and predictive analytics. The solution will enhance decision-making through automated risk scoring, compliance monitoring, and early warning systems for potential issues."

    elif "Cloud" in project_name:
        return f"Strategic cloud migration project for {industry.lower()} applications, including architecture redesign and implementation of cloud-native solutions. The initiative will improve scalability and reduce infrastructure costs while ensuring robust security and compliance with industry standards."

    elif "AI" in project_name or "ML" in project_name:
        return f"Development and deployment of AI/ML solutions to automate key processes and enhance decision-making in {industry.lower()}. The project will implement predictive models, natural language processing, and computer vision systems to drive innovation and competitive advantage."

    elif "Security" in project_name:
        return f"Implementation of a comprehensive security framework for {industry.lower()}, including threat detection, incident response, and compliance monitoring systems. The solution will strengthen cybersecurity posture through advanced threat intelligence, zero-trust architecture, and automated security operations."

    elif "Mobile" in project_name:
        return f"Development of a mobile-first solution for {industry.lower()} that provides seamless access to critical business functions and real-time data. The application will feature offline capabilities, biometric security, and integration with existing enterprise systems to enhance productivity and user experience."

    else:
        return f"Strategic consulting project for {industry.lower()}, focusing on technology-driven transformation and process optimization. The initiative will implement best practices, establish performance metrics, and deliver measurable improvements in operational efficiency and business outcomes."


def generate_project_dates():
    # Define the date range
    min_start = datetime(2024, 1, 1)
    max_end = datetime(2025, 12, 31)

    # Determine duration category based on distribution
    duration_category = random.random()

    if duration_category < 0.5:  # 50% chance: 3-6 months
        duration_days = random.randint(90, 180)
    elif duration_category < 0.75:  # 25% chance: 8-12 months
        duration_days = random.randint(240, 365)
    elif duration_category < 0.9:  # 15% chance: 1-3 months
        duration_days = random.randint(30, 90)
    else:  # 10% chance: 1-5 years
        duration_days = min((max_end - min_start).days, 1825)  # Cap at available range

    # Start with the minimum start date
    start_date = min_start

    # Calculate the maximum possible start date that allows for the full duration
    max_start = max_end - timedelta(days=duration_days)

    # If max_start is after min_start, we can randomize the start date
    if max_start > min_start:
        days_range = (max_start - min_start).days
        random_days = random.randint(0, days_range)
        start_date = min_start + timedelta(days=random_days)

    # Calculate end date based on start date and duration
    end_date = start_date + timedelta(days=duration_days)

    # Final validation
    if end_date > max_end:
        end_date = max_end
        start_date = end_date - timedelta(days=duration_days)

    # Ensure dates are in correct order
    if start_date >= end_date:
        start_date = min_start
        end_date = start_date + timedelta(days=60)  # Minimum 2-month project

    return start_date.strftime("%m/%d/%Y"), end_date.strftime("%m/%d/%Y")


def load_data(connection):
    """Load and format data from CSV files into database"""
    try:
        # Read the CSV file
        projects_df = pd.read_csv("projects_fixed.csv")

        print("\nColumn names in CSV:")
        print(projects_df.columns.tolist())

        # Clean column names by stripping whitespace
        projects_df.columns = projects_df.columns.str.strip()
        print("\nCleaned column names:")
        print(projects_df.columns.tolist())

        # Create a copy for date analysis
        analysis_df = projects_df.copy()

        # Update project dates
        for project in projects_df.itertuples():
            start_date, end_date = generate_project_dates()
            projects_df.at[project.Index, "start_date"] = start_date
            projects_df.at[project.Index, "end_date"] = end_date
            analysis_df.at[project.Index, "start_date"] = start_date
            analysis_df.at[project.Index, "end_date"] = end_date

        # Convert dates to datetime for analysis only in analysis_df
        analysis_df["start_date"] = pd.to_datetime(analysis_df["start_date"])
        analysis_df["end_date"] = pd.to_datetime(analysis_df["end_date"])

        print("\nData distribution summary:")
        print("\nStart dates by year:")
        print(analysis_df["start_date"].dt.year.value_counts().sort_index())

        print("\nProject durations:")
        durations = (analysis_df["end_date"] - analysis_df["start_date"]).dt.days
        print("Average duration (days):", durations.mean())
        print("Duration distribution:")
        print("1-3 months:", len(durations[(durations >= 30) & (durations <= 90)]))
        print("3-6 months:", len(durations[(durations > 90) & (durations <= 180)]))
        print("8-12 months:", len(durations[(durations > 240) & (durations <= 365)]))
        print("1-5 years:", len(durations[durations > 365]))

        # Format locations
        locations = projects_df["Location"].apply(format_location)
        projects_df["location_city"] = locations.apply(lambda x: x[0])
        projects_df["location_country"] = locations.apply(lambda x: x[1])

        # Improve descriptions
        projects_df["description"] = projects_df.apply(
            lambda row: get_improved_description(
                row["project_name"], row["preferred_industry"]
            ),
            axis=1,
        )

        # Select and reorder columns
        projects_df = projects_df[
            [
                "id",
                "project_name",
                "preferred_industry",
                "start_date",
                "end_date",
                "location_city",
                "location_country",
                "difficulty",
                "description",
                "required_skill1",
                "required_skill2",
                "required_skill3",
            ]
        ]

        # Print data distribution summary
        print("\nData distribution summary:")
        print("\nStart dates by year:")
        print(projects_df["start_date"].dt.year.value_counts().sort_index())
        print("\nEnd dates by year:")
        print(projects_df["end_date"].dt.year.value_counts().sort_index())
        print("\nLocations distribution:")
        print(projects_df["location_country"].value_counts())
        print("\nDifficulty distribution:")
        print(projects_df["difficulty"].value_counts())

        # Create SQLAlchemy engine
        engine = create_engine(
            "postgresql://postgres:aullah6@localhost:5432/consultant_matcher"
        )

        # Load data into database
        projects_df.to_sql("projects", engine, if_exists="replace", index=False)
        print("\nData loaded successfully")

        # Print sample of descriptions
        print("\nSample of project descriptions:")
        print(projects_df[["project_name", "description"]].head())

    except Exception as e:
        print(f"Error loading data: {e}")
        import traceback

        print(traceback.format_exc())


def main():
    # Connect to database
    connection = connect_to_db()
    if connection is None:
        return

    # Load formatted data
    load_data(connection)

    # Close connection
    connection.close()


if __name__ == "__main__":
    main()
