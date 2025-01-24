from filter import FirstPhaseFilter
import json


def test_filtering():
    # Sample test data
    project = {
        "project_name": "AI Implementation",
        "preferred_industry": "Technology",
        "start_date": "2024-06-01",
        "end_date": "2024-12-31",
        "location_city": "Vancouver",
        "difficulty": "expert",
        "required_skill1": "Python",
        "required_skill2": "Machine Learning",
        "required_skill3": "TensorFlow",
    }

    consultants = [
        {
            "id": 1,
            "current_availability": True,
            "location_flexibility": True,
            "seniority_level": "Senior",
            "skill1": "Python",
            "skill2": "Machine Learning",
            "skill3": "AWS",
            "years_of_experience": 10,
            "preferred_industries": "Technology,Finance",
            "location": "Toronto",
        },
        {
            "id": 2,
            "current_availability": True,
            "location_flexibility": False,
            "seniority_level": "Mid",
            "skill1": "Java",
            "skill2": "Spring",
            "skill3": "SQL",
            "years_of_experience": 5,
            "preferred_industries": "Technology",
            "location": "Vancouver",
        },
    ]

    # Initialize filter
    filter_engine = FirstPhaseFilter()

    # Get matches
    matches = filter_engine.get_top_matches(consultants, project)

    # Print results
    print("\nProject Requirements:")
    print(json.dumps(project, indent=2))

    print("\nMatched Consultants:")
    for consultant in matches:
        print(f"\nConsultant ID: {consultant['id']}")
        print(f"Match Score: {consultant['match_score']}")
        print(
            json.dumps(
                {k: v for k, v in consultant.items() if k != "match_score"}, indent=2
            )
        )


if __name__ == "__main__":
    test_filtering()
