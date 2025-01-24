from db import Database
from filter import FirstPhaseFilter
import json
from datetime import datetime


def format_consultant_output(consultant, score):
    """Format consultant information for display"""
    return f"""
    ID: {consultant['id']}
    Name: {consultant['first_name']} {consultant['last_name']}
    Match Score: {score:.2f}
    Skills: {consultant['skill1']}, {consultant['skill2']}, {consultant['skill3']}
    Experience: {consultant['years_of_experience']} years
    Location: {consultant['location']}
    Industries: {consultant['preferred_industries']}
    Availability: {'Yes' if consultant['current_availability'] else 'No'}
    Location Flexible: {'Yes' if consultant['location_flexibility'] else 'No'}
    """


def run_trial():
    # Initialize database and filter engine
    print("Initializing database connection...")
    db = Database()
    filter_engine = FirstPhaseFilter()

    # Get all consultants
    print("Fetching consultants...")
    consultants = db.get_all_consultants()
    print(f"Found {len(consultants)} consultants in database")

    # Get a specific project (let's use ID 1 as an example)
    print("\nFetching project details...")
    project = db.get_project_by_id(1)

    # Print project details
    print("\nProject Details:")
    print("-" * 50)
    print(f"Name: {project['project_name']}")
    print(f"Industry: {project['preferred_industry']}")
    print(f"Location: {project['location_city']}")
    print(f"Difficulty: {project['difficulty']}")
    print(
        f"Required Skills: {project['required_skill1']}, {project['required_skill2']}, {project['required_skill3']}"
    )
    print(f"Timeline: {project['start_date']} to {project['end_date']}")
    print("-" * 50)

    # Get matches
    print("\nFinding matches...")
    matches = filter_engine.get_top_matches(consultants, project)

    # Print results
    print(f"\nFound {len(matches)} potential matches")
    print("\nTop 10 Matches:")
    print("=" * 50)

    for idx, consultant in enumerate(matches, 1):
        print(
            f"\n{idx}. {format_consultant_output(consultant, consultant['match_score'])}"
        )
        print("-" * 30)

    # Print summary statistics
    if matches:
        scores = [m["match_score"] for m in matches]
        print("\nMatch Statistics:")
        print(f"Highest Score: {max(scores):.2f}")
        print(f"Average Score: {sum(scores)/len(scores):.2f}")
        print(f"Lowest Score: {min(scores):.2f}")


if __name__ == "__main__":
    run_trial()
