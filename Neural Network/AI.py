import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from datetime import datetime
import tensorflow as tf
from typing import List, Dict, Tuple, Optional
import json

class ConsultantProjectMatcher:
    def __init__(self):
        # Initialize weights for different matching criteria
        self.weights = {
            'skills': 0.4,
            'past_project_industry': 0.3,
            'preferred_industry': 0.2,
            'experience': 0.1
        }
        
        # Difficulty mapping
        self.DIFFICULTY_MAP = {
            'easy': 1,
            'medium': 2,
            'hard': 3,
            'expert': 4
        }
        
        # Initialize neural network layers
        self.initialize_neural_network()
        
        # Initialize encoders
        self.skill_encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        self.industry_encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        self.scaler = StandardScaler()

    def initialize_neural_network(self):
        """Initialize the three-phase neural network"""
        # Phase 1: Filtering Layer
        self.filtering_layer = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])

        # Phase 2: Matching Layer
        self.matching_layer = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(20,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])

        # Phase 3: Post-Matching Layer
        self.post_matching_layer = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(15,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])

    def parse_consultant_availability(self, availability_str: str) -> Tuple[datetime, datetime]:
        """Parse consultant availability date range"""
        start_date, end_date = availability_str.split(" to ")
        return (
            datetime.strptime(start_date, '%Y-%m-%d'),
            datetime.strptime(end_date, '%Y-%m-%d')
        )

    def phase1_filtering(self, project: Dict, consultant: Dict) -> bool:
        """Phase 1: Filter consultants based on availability and location"""
        # Parse dates
        project_start = datetime.strptime(project['start_date'], '%Y-%m-%d')
        project_end = datetime.strptime(project['end_date'], '%Y-%m-%d')
        
        # Parse consultant availability
        consultant_start, consultant_end = self.parse_consultant_availability(consultant['current_availability'])
        
        # Check if consultant is available during project timeline
        if not (consultant_start <= project_start and consultant_end >= project_end):
            return False
            
        # Check location requirements (simplified for now)
        if project['Location'].lower() != 'montreal' and not consultant['location_flexibility']:
            return False
            
        return True

    def calculate_skill_match(self, project_skills: np.ndarray, consultant_skills: np.ndarray) -> float:
        """Calculate skill match score using cosine similarity"""
        dot_product = np.dot(project_skills.flatten(), consultant_skills.flatten())
        norm_product = np.linalg.norm(project_skills) * np.linalg.norm(consultant_skills)
        return dot_product / norm_product if norm_product != 0 else 0

    def preprocess_data(self, project: Dict, consultant: Dict) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Preprocess project and consultant data for neural network input"""
        # Convert skills to numerical representations
        project_skills = np.array([
            project['required_skill1'],
            project['required_skill2'],
            project['required_skill3']
        ]).reshape(1, -1)
        
        consultant_skills = np.array([
            consultant['skill1'],
            consultant['skill2'],
            consultant['skill3']
        ]).reshape(1, -1)
        
        # Encode skills
        project_skills_encoded = self.skill_encoder.fit_transform(project_skills)
        consultant_skills_encoded = self.skill_encoder.transform(consultant_skills)
        
        # Encode industries
        project_industry = np.array([[project['preferred_industry']]])
        consultant_industries = np.array([[
            consultant['past_project_industry'],
            consultant['preffered_industries']  # Note: handling typo in data
        ]])
        
        project_industry_encoded = self.industry_encoder.fit_transform(project_industry)
        consultant_industries_encoded = self.industry_encoder.transform(consultant_industries)
        
        # Scale numerical features
        numerical_features = np.array([[
            consultant['years_of_experience'],
            self.DIFFICULTY_MAP.get(project['difficulty'].lower(), 2)  # Default to medium if unknown
        ]])
        numerical_features_scaled = self.scaler.fit_transform(numerical_features)
        
        return project_skills_encoded, consultant_skills_encoded, numerical_features_scaled

    def phase2_matching(self, project: Dict, consultant: Dict, 
                       project_skills_encoded: np.ndarray, 
                       consultant_skills_encoded: np.ndarray,
                       numerical_features_scaled: np.ndarray) -> float:
        """Phase 2: Calculate weighted compatibility score"""
        # Calculate skill match
        skill_match = self.calculate_skill_match(project_skills_encoded, consultant_skills_encoded)
        
        # Calculate industry match
        industry_match = float(project['preferred_industry'] == consultant['past_project_industry'])
        preferred_industry_match = float(project['preferred_industry'] in consultant['preferred_industries'])
        
        # Calculate experience match
        experience_match = 1.0 - abs(numerical_features_scaled[0][0] - numerical_features_scaled[0][1])
        
        # Calculate weighted score
        total_score = (
            self.weights['skills'] * skill_match +
            self.weights['past_project_industry'] * industry_match +
            self.weights['preferred_industry'] * preferred_industry_match +
            self.weights['experience'] * experience_match
        )
        
        return total_score

    def phase3_post_matching(self, project: Dict, consultant: Dict, base_score: float) -> float:
        """Phase 3: Refine matches using soft attributes"""
        # Initialize refinement score
        refinement_score = 0.0
        
        # Consider certifications
        if consultant['certifications']:
            refinement_score += 0.05
            
        # Consider diversity factors (small positive adjustment)
        if project.get('target_diversity'):
            refinement_score += 0.03
            
        # Consider hobbies (very small positive adjustment)
        if consultant['hobbies']:
            refinement_score += 0.02
            
        # Apply refinements to base score (max 10% adjustment)
        final_score = min(base_score * (1 + refinement_score), 1.0)
        
        return final_score

    def match_consultants_to_project(self, project: Dict, consultants: List[Dict]) -> List[Dict]:
        """Main matching function that combines all phases"""
        matches = []
        
        for consultant in consultants:
            # Phase 1: Filtering
            if not self.phase1_filtering(project, consultant):
                continue
                
            # Preprocess data
            project_skills_encoded, consultant_skills_encoded, numerical_features_scaled = \
                self.preprocess_data(project, consultant)
            
            # Phase 2: Calculate base compatibility score
            base_score = self.phase2_matching(
                project, consultant,
                project_skills_encoded, consultant_skills_encoded,
                numerical_features_scaled
            )
            
            # Phase 3: Refine score
            final_score = self.phase3_post_matching(project, consultant, base_score)
            
            # Store match details
            match_details = {
                'consultant_id': consultant['id'],
                'name': f"{consultant['first_name']} {consultant['last_name']}",
                'total_score': final_score,
                'score_breakdown': {
                    'skills_match': self.calculate_skill_match(project_skills_encoded, consultant_skills_encoded),
                    'industry_match': float(project['preferred_industry'] == consultant['past_project_industry']),
                    'preferred_industry_match': float(project['preferred_industry'] in consultant['preferred_industries']),
                    'experience_match': 1.0 - abs(numerical_features_scaled[0][0] - numerical_features_scaled[0][1])
                }
            }
            
            matches.append(match_details)
        
        # Sort matches by score and get top 3
        matches.sort(key=lambda x: x['total_score'], reverse=True)
        top_matches = matches[:3]
        
        # Prepare final output
        result = {
            'project_id': project['id'],
            'project_name': project['project_name'],
            'top_matches': top_matches
        }
        
        return result

    def save_matches_to_json(self, matches: Dict, filename: str):
        """Save matching results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(matches, f, indent=4)

# Example usage:
if __name__ == "__main__":
    # Initialize matcher
    matcher = ConsultantProjectMatcher()
    
    # Example project using the provided format
    project = {
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
    }
    
    # Example consultant using the provided format
    consultants = [
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
        }
    ]
    
    # Get matches
    matches = matcher.match_consultants_to_project(project, consultants)
    
    # Save results
    matcher.save_matches_to_json(matches, 'matches.json')
