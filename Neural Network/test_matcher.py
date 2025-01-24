import unittest
from datetime import datetime
from AI import ConsultantProjectMatcher

class TestConsultantMatcher(unittest.TestCase):
    def setUp(self):
        self.matcher = ConsultantProjectMatcher()
        
        # Test Projects
        self.projects = [
            {
                'id': '1',
                'project_name': 'E-commerce Personalization Engine',
                'preferred_industry': 'Insurance',
                'start_date': '2024-05-30',
                'end_date': '2024-07-14',
                'Location': 'Austin',
                'difficulty': 'easy',
                'Description': 'business process reengineering',
                'required_skill1': 'Technical Writing',
                'required_skill2': 'ETL Processes',
                'required_skill3': 'Power BI'
            },
            {
                'id': '2',
                'project_name': 'Talent Acquisition System',
                'preferred_industry': 'HealthTech',
                'start_date': '2024-07-03',
                'end_date': '2024-10-16',
                'Location': 'Toronto',
                'difficulty': 'hard',
                'Description': 'risk analysis',
                'required_skill1': 'Communication',
                'required_skill2': 'UX/UI Design',
                'required_skill3': 'React'
            }
        ]
        
        # Test Consultants
        self.consultants = [
            {
                'id': '1',
                'first_name': 'Cindra',
                'last_name': 'McCaughren',
                'email': 'cmccaughren0@webnode.com',
                'gender': 'Transmasculine',
                'seniority_level': 'mid-level',
                'skill1': 'Machine Learning',
                'skill2': 'User Experience (UX)',
                'skill3': 'Data Analysis',
                'years_of_experience': 9,
                'current_availability': '2024-06-20 to 2024-09-18',
                'location_flexibility': 'Canadian Citizen',
                'preffered_industries': 'Consumer Goods',
                'certifications': 'Salesforce Certified Administrator',
                'hobbies': 'Public Speaking',
                'ethnic': 'Menominee',
                'past_project_industry': 'Biotechnology'
            },
            {
                'id': '2',
                'first_name': 'Daffie',
                'last_name': 'Burroughes',
                'email': 'dburroughes1@goo.gl',
                'gender': 'Cis Woman',
                'seniority_level': 'intern',
                'skill1': 'Cybersecurity',
                'skill2': 'Data Analysis',
                'skill3': 'Change Management',
                'years_of_experience': 9,
                'current_availability': '2024-08-30 to 2024-11-28',
                'location_flexibility': 'Valid UK Visa',
                'preffered_industries': 'Gaming',
                'certifications': 'Power BI Data Analyst Associate',
                'hobbies': 'Brewing Coffee',
                'ethnic': 'South American',
                'past_project_industry': 'Aerospace Engineering'
            }
        ]

    def test_availability_filtering(self):
        """Test that consultants are filtered based on availability"""
        project = self.projects[0]  # Project runs 2024-05-30 to 2024-07-14
        consultant = self.consultants[0]  # Available 2024-06-20 to 2024-09-18
        
        # This consultant should not be available (starts after project starts)
        is_available = self.matcher.phase1_filtering(project, consultant)
        self.assertFalse(is_available)
        
        # Test second consultant (completely unavailable for this project)
        consultant2 = self.consultants[1]  # Available 2024-08-30 to 2024-11-28
        is_available = self.matcher.phase1_filtering(project, consultant2)
        self.assertFalse(is_available)

    def test_skill_matching(self):
        """Test skill matching calculation"""
        project = self.projects[1]  # Requires UX/UI Design
        consultant = self.consultants[0]  # Has User Experience (UX)
        
        # Preprocess data
        project_skills_encoded, consultant_skills_encoded, _ = \
            self.matcher.preprocess_data(project, consultant)
        
        # Calculate skill match
        skill_match = self.matcher.calculate_skill_match(
            project_skills_encoded, 
            consultant_skills_encoded
        )
        
        # Should have some match due to UX skills
        self.assertGreater(skill_match, 0)

    def test_full_matching_process(self):
        """Test the entire matching process"""
        project = self.projects[1]  # Talent Acquisition System project
        
        # Get matches
        matches = self.matcher.match_consultants_to_project(project, self.consultants)
        
        # Verify output format
        self.assertIn('project_id', matches)
        self.assertIn('project_name', matches)
        self.assertIn('top_matches', matches)
        
        # Verify project details
        self.assertEqual(matches['project_id'], '2')
        self.assertEqual(matches['project_name'], 'Talent Acquisition System')
        
        # Print match details for inspection
        print("\nMatch Results:")
        print(f"Project: {matches['project_name']}")
        print("Top Matches:")
        for match in matches['top_matches']:
            print(f"- {match['name']}: {match['total_score']:.2f}")
            print(f"  Score Breakdown: {match['score_breakdown']}")

if __name__ == '__main__':
    unittest.main(verbosity=2) 