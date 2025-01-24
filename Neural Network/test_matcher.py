import unittest
from datetime import datetime
from AI import ThreePhaseMatcher


class TestConsultantMatcher(unittest.TestCase):
    def setUp(self):
        """
        Initialize the ThreePhaseMatcher and test data.
        We'll focus on matching the new code's method names:
         - filter_phase
         - compute_skill_score
         - match_consultants_to_project˚
        """
        self.matcher = ThreePhaseMatcher()

        # Example project(s)
        self.projects = [
            {
                "id": 1,
                "project_name": "E-commerce Personalization Engine",
                "preferred_industry": "Insurance",
                "start_date": "2024-05-30",
                "end_date": "2024-07-14",
                "Location": "Austin",
                "difficulty": "easy",
                "Description": "business process reengineering",
                "required_skill1": "Technical Writing",
                "required_skill2": "ETL Processes",
                "required_skill3": "Power BI",
            },
            {
                "id": 2,
                "project_name": "Talent Acquisition System",
                "preferred_industry": "HealthTech",
                "start_date": "2024-07-03",
                "end_date": "2024-10-16",
                "Location": "Toronto",
                "difficulty": "hard",
                "Description": "risk analysis",
                "required_skill1": "Communication",
                "required_skill2": "UX/UI Design",
                "required_skill3": "React",
            },
        ]

        # Example consultant(s)
        self.consultants = [
            {
                "id": 1,
                "first_name": "Cindra",
                "last_name": "McCaughren",
                "skill1": "Machine Learning",
                "skill2": "User Experience (UX)",
                "skill3": "Data Analysis",
                "years_of_experience": 9,
                "current_availability": "2024-06-20 to 2024-09-18",
                "location_flexibility": "Canadian Citizen",
                "past_project_industry": "Biotechnology",
            },
            {
                "id": 2,
                "first_name": "Daffie",
                "last_name": "Burroughes",
                "skill1": "Cybersecurity",
                "skill2": "Data Analysis",
                "skill3": "Change Management",
                "years_of_experience": 9,
                "current_availability": "2024-05-01 to 2024-10-20",
                "location_flexibility": "Valid UK Visa",
                "past_project_industry": "HealthTech",  # Matches project #2
            },
        ]

    def test_availability_filtering(self):
        """
        Test that 'filter_phase' correctly filters consultants
        based on availability for the entire project window.
        """
        project = self.projects[0]  # 2024-05-30 to 2024-07-14

        # Consultant 1 has 2024-06-20 to 2024-09-18 (starts after 05-30 => no coverage)
        consultant1 = self.consultants[0]
        self.assertFalse(
            self.matcher.filter_phase(project, consultant1),
            "Consultant 1 should fail filter since availability starts after project start.",
        )

        # Consultant 2 has 2024-05-01 to 2024-10-20 (covers entire window => pass)
        consultant2 = self.consultants[1]
        self.assertTrue(
            self.matcher.filter_phase(project, consultant2),
            "Consultant 2 should pass filter since availability covers the project fully.",
        )

    def test_skill_matching(self):
        """
        Test that 'compute_skill_score' gives a partial match > 0
        for overlapping tokens (e.g. 'UX/UI Design' vs 'User Experience (UX)').
        """
        project = self.projects[1]  # requires: UX/UI Design
        consultant = self.consultants[0]  # has: User Experience (UX)

        score = self.matcher.compute_skill_score(project, consultant)
        self.assertGreater(score, 0, f"Expected partial skill match > 0; got {score}")

    def test_full_matching_process(self):
        """
        Test the entire pipeline with match_consultants_to_project.
        Ensures it returns a valid structure and sorts by final score.
        """
        project = self.projects[1]  # Talent Acquisition System
        results = self.matcher.match_consultants_to_project(project, self.consultants)

        # Basic structure checks
        self.assertIn("project_id", results)
        self.assertIn("project_name", results)
        self.assertIn("top_matches", results)

        # Print for manual inspection
        print("\nMatch Results:")
        print(f"Project: {results['project_name']}")
        print("Top Matches:")
        for match in results["top_matches"]:
            print(f"- {match['consultant_name']}: {match['base_score']}")

        # If top_matches is not empty, assert descending order
        top_matches = results["top_matches"]
        if len(top_matches) > 1:
            for i in range(len(top_matches) - 1):
                self.assertGreaterEqual(
                    top_matches[i]["base_score"],
                    top_matches[i + 1]["base_score"],
                    "Match scores should be sorted descending.",
                )


if __name__ == "__main__":
    unittest.main(verbosity=2)
