import unittest
from datetime import date
from Backend import (
    Consultant, 
    Project, 
    DifficultyLevel, 
    ConsultantMatcher
)

class TestConsultantMatcher(unittest.TestCase):
    def setUp(self):
        self.matcher = ConsultantMatcher()
        
        # Create a pool of consultants with diverse backgrounds and skills
        self.consultants = [
            Consultant(
                consultant_id="C1",
                name="Alice Johnson",
                skills=["Python", "Data Analysis", "Machine Learning"],
                expertise=["AI", "Big Data"],
                years_experience=8,
                availability=True,
                preferences=["AI Projects", "Data Science"],
                gender="Female",
                ethnicity="Asian",
                conflicts=["C2"],
                performance_rating=9,
                current_workload=30
            ),
            Consultant(
                consultant_id="C2",
                name="Bob Smith",
                skills=["Java", "Project Management", "Cloud Computing"],
                expertise=["AWS", "Team Leadership"],
                years_experience=12,
                availability=True,
                preferences=["Cloud Projects", "Team Lead"],
                gender="Male",
                ethnicity="Caucasian",
                conflicts=["C1"],
                performance_rating=8,
                current_workload=50
            ),
            Consultant(
                consultant_id="C3",
                name="Carlos Rodriguez",
                skills=["Python", "DevOps", "Cloud Computing"],
                expertise=["Azure", "CI/CD"],
                years_experience=5,
                availability=True,
                preferences=["DevOps", "Cloud Projects"],
                gender="Male",
                ethnicity="Hispanic",
                conflicts=[],
                performance_rating=7,
                current_workload=40
            ),
            Consultant(
                consultant_id="C4",
                name="Diana Chen",
                skills=["Java", "Mobile Development", "UI/UX"],
                expertise=["Android", "iOS"],
                years_experience=6,
                availability=True,
                preferences=["Mobile Apps", "UI Design"],
                gender="Female",
                ethnicity="Asian",
                conflicts=["C5"],
                performance_rating=8,
                current_workload=60
            ),
            Consultant(
                consultant_id="C5",
                name="Eric Williams",
                skills=["JavaScript", "React", "Node.js"],
                expertise=["Frontend", "Full Stack"],
                years_experience=4,
                availability=True,
                preferences=["Web Development", "Frontend"],
                gender="Male",
                ethnicity="African American",
                conflicts=["C4"],
                performance_rating=7,
                current_workload=20
            )
        ]

    def print_team_assignment(self, assignment, project_name):
        print(f"\n=== {project_name} Team Assignment ===")
        print(f"Project: {project_name}")
        print("Assigned Consultants:")
        for consultant in assignment.consultants:
            print(f"- {consultant.name}")
            print(f"  Skills: {', '.join(consultant.skills)}")
            print(f"  Expertise: {', '.join(consultant.expertise)}")
            print(f"  Gender: {consultant.gender}")
            print(f"  Ethnicity: {consultant.ethnicity}")
            print(f"  Experience: {consultant.years_experience} years")
            print()
        print(f"Skill Balance: {assignment.skill_balance_notes}")
        print(f"Diversity Notes: {assignment.diversity_notes}")
        print(f"Conflict Notes: {assignment.conflict_notes}")
        print("=" * 50)

    def test_case1_ai_project(self):
        """Test case 1: AI Project requiring specific technical skills"""
        project = Project(
            project_id="P1",
            name="AI Implementation",
            required_skills=["Python", "Machine Learning"],
            required_expertise=["AI", "Data Analysis"],
            difficulty_level=DifficultyLevel.HARD,
            team_size=2,
            timeline=date(2024, 12, 31)
        )
        
        assignment = self.matcher.match_consultants_to_project(project, self.consultants)
        self.print_team_assignment(assignment, "AI Implementation Project")
        
        # Verify team size is adjusted for HARD difficulty
        self.assertEqual(len(assignment.consultants), 3)  # 2 * 1.5 rounded to 3
        
        # Verify at least one team member has AI expertise
        has_ai_expert = any("AI" in c.expertise for c in assignment.consultants)
        self.assertTrue(has_ai_expert)
        
        # Check for conflicts
        assigned_ids = [c.consultant_id for c in assignment.consultants]
        self.assertFalse("C1" in assigned_ids and "C2" in assigned_ids)

    def test_case2_conflict_handling(self):
        """Test case 2: Project with conflicting consultants"""
        project = Project(
            project_id="P2",
            name="Mobile App Development",
            required_skills=["Java", "Mobile Development", "UI/UX"],
            required_expertise=["Android", "iOS"],
            difficulty_level=DifficultyLevel.MEDIUM,
            team_size=2,
            timeline=date(2024, 10, 15)
        )
        
        # Only provide consultants C4 and C5 who have conflicts
        conflicting_consultants = [c for c in self.consultants if c.consultant_id in ["C4", "C5"]]
        assignment = self.matcher.match_consultants_to_project(project, conflicting_consultants)
        
        # Verify only one of the conflicting consultants is assigned
        self.assertLessEqual(len(assignment.consultants), 1)
        
        if len(assignment.consultants) == 1:
            # Verify the assigned consultant has mobile development skills
            assigned = assignment.consultants[0]
            self.assertIn("Mobile Development", assigned.skills)

    def test_case3_diversity_balance(self):
        """Test case 3: Project focusing on team diversity"""
        project = Project(
            project_id="P3",
            name="Full Stack Web Application",
            required_skills=["JavaScript", "Python", "Cloud Computing"],
            required_expertise=["Frontend", "Backend", "DevOps"],
            difficulty_level=DifficultyLevel.MEDIUM,
            team_size=3,
            timeline=date(2024, 11, 30)
        )
        
        assignment = self.matcher.match_consultants_to_project(project, self.consultants)
        self.print_team_assignment(assignment, "Full Stack Web Project (Diversity Test)")
        
        # Verify team size
        self.assertEqual(len(assignment.consultants), 3)
        
        # Check for gender diversity
        genders = [c.gender for c in assignment.consultants]
        self.assertTrue(len(set(genders)) > 1, "Team should have gender diversity")
        
        # Check for ethnic diversity
        ethnicities = [c.ethnicity for c in assignment.consultants]
        self.assertTrue(len(set(ethnicities)) > 1, "Team should have ethnic diversity")
        
        # Verify skill coverage
        all_skills = set()
        for consultant in assignment.consultants:
            all_skills.update(consultant.skills)
        
        required_skills_covered = all(skill in all_skills for skill in project.required_skills)
        self.assertTrue(required_skills_covered, "Team should cover all required skills")

if __name__ == '__main__':
    print("\n=== Running Consultant Matcher Tests ===")
    unittest.main(verbosity=2) 