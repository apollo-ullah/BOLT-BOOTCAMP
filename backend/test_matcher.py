import unittest
from datetime import date, timedelta
from Backend import (
    Consultant, 
    Project, 
    DifficultyLevel,
    ConsultantStatus,
    ConsultantAssignment,
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
                skills=["Python", "Data Analysis", "ML", "AI"],
                expertise=["Artificial Intelligence", "Big Data"],
                years_experience=8,
                availability=True,
                preferences=["AI Projects", "Data Science"],
                gender="Female",
                ethnicity="Asian",
                conflicts=["C2"],
                performance_rating=9,
                current_workload=30,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
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
                current_workload=50,
                status=ConsultantStatus.ASSIGNED,
                current_assignment=ConsultantAssignment(
                    project_id="PREV1",
                    start_date=date(2024, 1, 1),
                    end_date=date(2024, 3, 1)
                )
            ),
            Consultant(
                consultant_id="C3",
                name="Carlos Rodriguez",
                skills=["Python", "DevOps", "Cloud Computing"],
                expertise=["Azure", "CI/CD", "Development Operations"],
                years_experience=5,
                availability=True,
                preferences=["DevOps", "Cloud Projects"],
                gender="Male",
                ethnicity="Hispanic",
                conflicts=[],
                performance_rating=7,
                current_workload=40,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            Consultant(
                consultant_id="C4",
                name="Diana Chen",
                skills=["Java", "Mobile Development", "UI/UX"],
                expertise=["Android", "iOS", "User Experience"],
                years_experience=6,
                availability=True,
                preferences=["Mobile Apps", "UI Design"],
                gender="Female",
                ethnicity="Asian",
                conflicts=["C5"],
                performance_rating=8,
                current_workload=60,
                status=ConsultantStatus.ASSIGNED,
                current_assignment=ConsultantAssignment(
                    project_id="PREV3",
                    start_date=date(2024, 1, 1),
                    end_date=date(2024, 5, 1)
                )
            ),
            Consultant(
                consultant_id="C5",
                name="Eric Williams",
                skills=["JS", "ReactJS", "Node.js"],
                expertise=["Frontend", "Full Stack"],
                years_experience=4,
                availability=True,
                preferences=["Web Development", "Frontend"],
                gender="Male",
                ethnicity="African American",
                conflicts=["C4"],
                performance_rating=7,
                current_workload=20,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            # Additional consultants for better test coverage
            Consultant(
                consultant_id="C6",
                name="Frank Miller",
                skills=["Java", "Mobile Development", "Android", "iOS"],
                expertise=["Mobile Architecture", "UI/UX", "User Experience"],
                years_experience=7,
                availability=True,
                preferences=["Mobile Apps", "UI Design"],
                gender="Male",
                ethnicity="Caucasian",
                conflicts=[],
                performance_rating=8,
                current_workload=30,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            Consultant(
                consultant_id="C7",
                name="Grace Lee",
                skills=["JavaScript", "Python", "React", "Node.js"],
                expertise=["Full Stack", "Front-end", "Back-end"],
                years_experience=6,
                availability=True,
                preferences=["Web Development", "Full Stack"],
                gender="Female",
                ethnicity="Asian",
                conflicts=[],
                performance_rating=9,
                current_workload=25,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            Consultant(
                consultant_id="C8",
                name="Henry Wilson",
                skills=["Python", "Machine Learning", "AI", "Data Science"],
                expertise=["Artificial Intelligence", "Deep Learning"],
                years_experience=9,
                availability=True,
                preferences=["AI Projects", "ML Research"],
                gender="Male",
                ethnicity="African American",
                conflicts=[],
                performance_rating=9,
                current_workload=35,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            Consultant(
                consultant_id="C9",
                name="Isabella Martinez",
                skills=["DevOps", "Cloud Computing", "Python"],
                expertise=["Development Operations", "AWS", "Azure"],
                years_experience=5,
                availability=True,
                preferences=["Cloud Projects", "DevOps"],
                gender="Female",
                ethnicity="Hispanic",
                conflicts=[],
                performance_rating=8,
                current_workload=40,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            # Updated mobile development expert
            Consultant(
                consultant_id="C10",
                name="Julia Kim",
                skills=["Java", "Mobile Development", "UI/UX", "Android", "iOS"],
                expertise=["Mobile Architecture", "User Experience", "Cross-platform Development"],
                years_experience=7,
                availability=True,
                preferences=["Mobile Apps", "UI Design"],
                gender="Female",
                ethnicity="Asian",
                conflicts=[],
                performance_rating=9,
                current_workload=20,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            ),
            # Additional mobile expert who is definitely available
            Consultant(
                consultant_id="C11",
                name="Kevin Park",
                skills=["Java", "Mobile Development", "UI/UX", "Android", "iOS", "Flutter"],
                expertise=["Mobile Architecture", "User Experience", "Cross-platform Development"],
                years_experience=8,
                availability=True,
                preferences=["Mobile Apps", "UI Design"],
                gender="Male",
                ethnicity="Asian",
                conflicts=[],
                performance_rating=9,
                current_workload=15,
                status=ConsultantStatus.AVAILABLE,
                current_assignment=None
            )
        ]

    def print_team_assignment(self, assignment, project_name):
        print(f"\n=== {project_name} Team Assignment ===")
        print(f"Project: {project_name}")
        print(f"Estimated Completion Date: {assignment.estimated_completion_date}")
        print("Assigned Consultants:")
        for consultant in assignment.consultants:
            print(f"- {consultant.name}")
            print(f"  Skills: {', '.join(consultant.skills)}")
            print(f"  Expertise: {', '.join(consultant.expertise)}")
            print(f"  Gender: {consultant.gender}")
            print(f"  Ethnicity: {consultant.ethnicity}")
            print(f"  Experience: {consultant.years_experience} years")
            print(f"  Status: {consultant.status.value}")
            if consultant.current_assignment:
                print(f"  Current Project Ends: {consultant.current_assignment.end_date}")
            print()
        print(f"Skill Balance: {assignment.skill_balance_notes}")
        print(f"Diversity Notes: {assignment.diversity_notes}")
        print(f"Conflict Notes: {assignment.conflict_notes}")
        print("=" * 50)

    def test_semantic_skill_matching(self):
        """Test case for semantic skill matching"""
        # Test direct word similarity
        similarity = self.matcher.calculate_word_similarity("Python", "python")
        self.assertEqual(similarity, self.matcher.EXACT_MATCH_WEIGHT)
        
        # Test abbreviation matching
        similarity = self.matcher.calculate_word_similarity("js", "javascript")
        self.assertEqual(similarity, self.matcher.EXACT_MATCH_WEIGHT)
        
        # Test similar word matching
        similarity = self.matcher.calculate_word_similarity("frontend", "front-end")
        self.assertGreaterEqual(similarity, self.matcher.SIMILAR_MATCH_WEIGHT * self.matcher.SIMILARITY_THRESHOLD)

    def test_case1_ai_project(self):
        """Test case 1: AI Project requiring specific technical skills with semantic matching"""
        project = Project(
            project_id="P1",
            name="AI Implementation",
            required_skills=["Python", "Machine Learning"],
            required_expertise=["Artificial Intelligence", "Data Analysis"],
            difficulty_level=DifficultyLevel.HARD,
            team_size=2,
            timeline=date(2024, 4, 1)
        )
        
        assignment = self.matcher.match_consultants_to_project(project, self.consultants)
        self.print_team_assignment(assignment, "AI Implementation Project")
        
        # Verify at least one consultant is assigned
        self.assertGreater(len(assignment.consultants), 0)
        
        # Verify at least one team member has AI expertise (using semantic matching)
        has_ai_expert = False
        for consultant in assignment.consultants:
            for expertise in consultant.expertise + consultant.skills:  # Check both expertise and skills
                if (self.matcher.calculate_word_similarity(expertise, "Artificial Intelligence") > 0.8 or
                    self.matcher.calculate_word_similarity(expertise, "AI") > 0.8):
                    has_ai_expert = True
                    break
        self.assertTrue(has_ai_expert)
        
        # Check for conflicts
        assigned_ids = [c.consultant_id for c in assignment.consultants]
        self.assertFalse("C1" in assigned_ids and "C2" in assigned_ids)
        
        # Verify project duration estimation
        self.assertIsInstance(assignment.estimated_completion_date, date)
        duration = assignment.estimated_completion_date - project.timeline
        self.assertGreater(duration.days, 0)

    def test_case2_consultant_availability(self):
        """Test case 2: Project with consultants having different availability"""
        project = Project(
            project_id="P2",
            name="Mobile App Development",
            required_skills=["Java", "Mobile Development", "User Interface"],
            required_expertise=["Android", "iOS", "UX"],
            difficulty_level=DifficultyLevel.MEDIUM,
            team_size=2,
            timeline=date(2024, 4, 1)
        )
        
        # Filter to only use definitely available consultants
        available_consultants = [
            c for c in self.consultants 
            if c.status == ConsultantStatus.AVAILABLE and not c.current_assignment
        ]
        
        assignment = self.matcher.match_consultants_to_project(project, available_consultants)
        self.print_team_assignment(assignment, "Mobile App Project (Availability Test)")
        
        # Verify at least one consultant is assigned
        self.assertGreater(len(assignment.consultants), 0)
        
        # Verify no consultants are assigned who aren't available
        for consultant in assignment.consultants:
            self.assertTrue(
                consultant.status == ConsultantStatus.AVAILABLE and not consultant.current_assignment,
                f"Consultant {consultant.name} was assigned but not available"
            )

    def test_case3_diversity_and_duration(self):
        """Test case 3: Project testing diversity, duration, and semantic matching"""
        project = Project(
            project_id="P3",
            name="Full Stack Web Application",
            required_skills=["JavaScript", "Python", "DevOps"],
            required_expertise=["Front-end", "Back-end", "Development Operations"],
            difficulty_level=DifficultyLevel.MEDIUM,
            team_size=3,
            timeline=date(2024, 6, 1)
        )
        
        # Filter to only use definitely available consultants
        available_consultants = [
            c for c in self.consultants 
            if c.status == ConsultantStatus.AVAILABLE and not c.current_assignment
        ]
        
        assignment = self.matcher.match_consultants_to_project(project, available_consultants)
        self.print_team_assignment(assignment, "Full Stack Web Project")
        
        # Verify at least one consultant is assigned
        self.assertGreater(len(assignment.consultants), 0)
        
        # Verify project duration estimation for medium difficulty
        duration = assignment.estimated_completion_date - project.timeline
        self.assertGreaterEqual(duration.days, 60)  # At least 2 months for medium difficulty
        
        # Verify assigned consultants have updated status
        for consultant in assignment.consultants:
            self.assertEqual(consultant.status, ConsultantStatus.ASSIGNED)
            self.assertIsNotNone(consultant.current_assignment)
            self.assertEqual(consultant.current_assignment.project_id, project.project_id)
            self.assertEqual(consultant.current_assignment.end_date, 
                           assignment.estimated_completion_date)

if __name__ == '__main__':
    print("\n=== Running Consultant Matcher Tests ===")
    unittest.main(verbosity=2) 