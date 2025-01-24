from dataclasses import dataclass
from typing import List, Dict, Set, Optional
from datetime import date, timedelta
from enum import Enum
import random
from collections import defaultdict
import difflib

class DifficultyLevel(Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class ConsultantStatus(Enum):
    AVAILABLE = "Available"
    ASSIGNED = "Assigned"
    UNAVAILABLE = "Unavailable"

@dataclass
class ConsultantAssignment:
    project_id: str
    start_date: date
    end_date: date

@dataclass
class Consultant:
    consultant_id: str
    name: str
    skills: List[str]
    expertise: List[str]
    years_experience: int
    availability: bool
    preferences: List[str]
    gender: str
    ethnicity: str
    conflicts: List[str]
    performance_rating: int  # 1-10
    current_workload: int  # 0-100%
    status: ConsultantStatus
    current_assignment: Optional[ConsultantAssignment] = None

    def is_available_for_project(self, project_start_date: date) -> bool:
        """Check if consultant is available for a project starting on given date"""
        if self.status == ConsultantStatus.UNAVAILABLE:
            return False
        if not self.current_assignment:
            return True
        
        # Consultant becomes available 2 weeks before current project ends
        availability_date = self.current_assignment.end_date - timedelta(days=14)
        return project_start_date >= availability_date

@dataclass
class Project:
    project_id: str
    name: str
    required_skills: List[str]
    required_expertise: List[str]
    difficulty_level: DifficultyLevel
    team_size: int
    timeline: date  # Project start date
    estimated_duration: Optional[timedelta] = None
    actual_end_date: Optional[date] = None

@dataclass
class TeamAssignment:
    project: Project
    consultants: List[Consultant]
    conflict_notes: List[str]
    diversity_notes: str
    skill_balance_notes: str
    estimated_completion_date: date

class ConsultantMatcher:
    def __init__(self):
        # Base weights for different factors
        self.EXPERIENCE_WEIGHT = 0.40
        self.SKILL_DIVERSITY_WEIGHT = 0.20
        self.DEMOGRAPHIC_DIVERSITY_WEIGHT = 0.15
        self.AVAILABILITY_WEIGHT = 0.15
        self.PREFERENCES_WEIGHT = 0.10

        # Similarity thresholds
        self.SIMILARITY_THRESHOLD = 0.8  # Minimum similarity score to consider words as matching
        
        # Word similarity weights
        self.EXACT_MATCH_WEIGHT = 1.0
        self.SIMILAR_MATCH_WEIGHT = 0.7
        
        # Base duration estimates (in days) for different difficulty levels
        self.BASE_DURATION = {
            DifficultyLevel.EASY: 30,    # 1 month
            DifficultyLevel.MEDIUM: 90,  # 3 months
            DifficultyLevel.HARD: 180    # 6 months
        }

        # Common technology word mappings for better matching
        self.TECH_SYNONYMS = {
            "js": "javascript",
            "py": "python",
            "ml": "machine learning",
            "ai": "artificial intelligence",
            "ui": "user interface",
            "ux": "user experience",
            "frontend": "front-end",
            "backend": "back-end",
            "fullstack": "full-stack",
            "react": "reactjs",
            "node": "nodejs",
            "ts": "typescript",
            "devops": "development operations",
            "db": "database"
        }

    def calculate_word_similarity(self, word1: str, word2: str) -> float:
        """Calculate similarity between two words"""
        # Convert to lowercase for comparison
        word1 = word1.lower()
        word2 = word2.lower()
        
        # Check exact match
        if word1 == word2:
            return self.EXACT_MATCH_WEIGHT
            
        # Check in tech synonyms
        word1_normalized = self.TECH_SYNONYMS.get(word1, word1)
        word2_normalized = self.TECH_SYNONYMS.get(word2, word2)
        if word1_normalized == word2_normalized:
            return self.EXACT_MATCH_WEIGHT
        
        # Calculate similarity ratio
        similarity = difflib.SequenceMatcher(None, word1_normalized, word2_normalized).ratio()
        
        # Return similarity score if it meets threshold
        if similarity >= self.SIMILARITY_THRESHOLD:
            return similarity * self.SIMILAR_MATCH_WEIGHT
        return 0.0

    def find_best_skill_matches(self, consultant_skills: List[str], required_skills: List[str]) -> Dict[str, float]:
        """Find the best matching skills between consultant and requirements"""
        matches = {}
        for req_skill in required_skills:
            best_match_score = 0.0
            for consultant_skill in consultant_skills:
                similarity = self.calculate_word_similarity(consultant_skill, req_skill)
                best_match_score = max(best_match_score, similarity)
            matches[req_skill] = best_match_score
        return matches

    def calculate_experience_score(self, consultant: Consultant, project: Project) -> float:
        """Calculate experience score based on years of experience and skill match with semantic similarity"""
        # Calculate skill matches with semantic similarity
        skill_matches = self.find_best_skill_matches(consultant.skills, project.required_skills)
        expertise_matches = self.find_best_skill_matches(consultant.expertise, project.required_expertise)
        
        # Calculate average skill match score
        skill_score = sum(skill_matches.values()) / len(project.required_skills)
        expertise_score = sum(expertise_matches.values()) / len(project.required_expertise)
        
        # Calculate experience score (normalized to max 10 years)
        experience_score = min(consultant.years_experience / 10, 1)
        
        # Weight the components
        SKILL_WEIGHT = 0.4
        EXPERTISE_WEIGHT = 0.4
        EXPERIENCE_WEIGHT = 0.2
        
        total_score = (
            skill_score * SKILL_WEIGHT +
            expertise_score * EXPERTISE_WEIGHT +
            experience_score * EXPERIENCE_WEIGHT
        )
        
        return total_score

    def estimate_project_duration(self, project: Project, team_size: int) -> timedelta:
        """
        Estimate project duration based on difficulty and team size
        Formula: base_duration * (1 + difficulty_modifier) * (1 / (1 + log(team_size)))
        """
        import math
        
        # Base duration estimates (in days) for different difficulty levels
        base_durations = {
            DifficultyLevel.EASY: 45,     # 1.5 months
            DifficultyLevel.MEDIUM: 90,   # 3 months
            DifficultyLevel.HARD: 180     # 6 months
        }
        
        base_duration = base_durations[project.difficulty_level]
        
        # Difficulty modifier
        difficulty_modifier = {
            DifficultyLevel.EASY: 0.2,    # 20% extra time
            DifficultyLevel.MEDIUM: 0.5,  # 50% extra time
            DifficultyLevel.HARD: 0.8     # 80% extra time
        }[project.difficulty_level]
        
        # Team size efficiency factor (diminishing returns with larger teams)
        # Using log base 3 for slower reduction and ensuring minimum team size of 1
        team_factor = 1 / (1 + math.log(max(team_size, 1), 3))
        
        # Calculate duration with all factors
        duration_days = int(base_duration * (1 + difficulty_modifier) * team_factor)
        
        # Ensure minimum durations based on difficulty
        min_durations = {
            DifficultyLevel.EASY: 30,
            DifficultyLevel.MEDIUM: 75,   # Increased minimum for medium projects
            DifficultyLevel.HARD: 120
        }
        
        return timedelta(days=max(duration_days, min_durations[project.difficulty_level]))

    def calculate_team_diversity_score(self, current_team: List[Consultant], candidate: Consultant) -> float:
        """Calculate how much diversity the candidate adds to the team's skill set"""
        if not current_team:
            return 1.0

        team_skills = set()
        for member in current_team:
            team_skills.update(member.skills)

        new_skills = set(candidate.skills) - team_skills
        return len(new_skills) / max(len(candidate.skills), 1)

    def calculate_demographic_diversity_score(self, current_team: List[Consultant], candidate: Consultant) -> float:
        """Calculate demographic diversity score"""
        if not current_team:
            return 1.0

        gender_ratio = defaultdict(int)
        ethnicity_ratio = defaultdict(int)
        
        for member in current_team:
            gender_ratio[member.gender] += 1
            ethnicity_ratio[member.ethnicity] += 1

        team_size = len(current_team)
        gender_balance = 1 - (gender_ratio[candidate.gender] / team_size)
        ethnicity_balance = 1 - (ethnicity_ratio[candidate.ethnicity] / team_size)
        
        return (gender_balance + ethnicity_balance) / 2

    def check_conflicts(self, current_team: List[Consultant], candidate: Consultant) -> bool:
        """Check for any conflicts of interest"""
        for member in current_team:
            if member.consultant_id in candidate.conflicts or candidate.consultant_id in member.conflicts:
                return False
        return True

    def calculate_availability_score(self, consultant: Consultant, project: Project) -> float:
        """Calculate availability score based on current workload and availability"""
        if not consultant.is_available_for_project(project.timeline):
            return 0.0
        return 1 - (consultant.current_workload / 100)

    def calculate_preference_score(self, consultant: Consultant, project: Project) -> float:
        """Calculate how well the project matches consultant preferences"""
        matching_preferences = len(set(consultant.preferences) & 
                                 {project.name} | set(project.required_skills))
        return matching_preferences / max(len(consultant.preferences), 1)

    def adjust_team_size(self, project: Project) -> int:
        """Adjust team size based on project difficulty and requirements"""
        base_size = project.team_size
        if project.difficulty_level == DifficultyLevel.HARD:
            return int(base_size * 1.5)
        elif project.difficulty_level == DifficultyLevel.EASY:
            return max(int(base_size * 0.8), 1)
        return base_size

    def match_consultants_to_project(self, 
                                   project: Project, 
                                   available_consultants: List[Consultant]) -> TeamAssignment:
        """Main matching algorithm to assign consultants to a project"""
        adjusted_team_size = self.adjust_team_size(project)
        assigned_team: List[Consultant] = []
        conflict_notes: List[str] = []
        
        # Filter consultants based on availability for project start date
        candidates = [c for c in available_consultants 
                     if c.is_available_for_project(project.timeline) and 
                     (c.status == ConsultantStatus.AVAILABLE or 
                      (c.current_assignment and 
                       c.current_assignment.end_date - timedelta(days=14) <= project.timeline))]
        
        while len(assigned_team) < adjusted_team_size and candidates:
            best_score = -1
            best_candidate = None
            
            for candidate in candidates:
                if not self.check_conflicts(assigned_team, candidate):
                    continue
                
                # Calculate scores for each factor
                experience_score = self.calculate_experience_score(candidate, project)
                diversity_score = self.calculate_team_diversity_score(assigned_team, candidate)
                demographic_score = self.calculate_demographic_diversity_score(assigned_team, candidate)
                availability_score = self.calculate_availability_score(candidate, project)
                preference_score = self.calculate_preference_score(candidate, project)
                
                # Calculate weighted total score
                total_score = (
                    experience_score * self.EXPERIENCE_WEIGHT +
                    diversity_score * self.SKILL_DIVERSITY_WEIGHT +
                    demographic_score * self.DEMOGRAPHIC_DIVERSITY_WEIGHT +
                    availability_score * self.AVAILABILITY_WEIGHT +
                    preference_score * self.PREFERENCES_WEIGHT
                )
                
                if total_score > best_score:
                    best_score = total_score
                    best_candidate = candidate
            
            if best_candidate:
                assigned_team.append(best_candidate)
                candidates.remove(best_candidate)
            else:
                break

        # Calculate estimated completion date
        project_duration = self.estimate_project_duration(project, len(assigned_team))
        estimated_completion = project.timeline + project_duration
        
        # Update consultant assignments
        for consultant in assigned_team:
            consultant.status = ConsultantStatus.ASSIGNED
            consultant.current_assignment = ConsultantAssignment(
                project_id=project.project_id,
                start_date=project.timeline,
                end_date=estimated_completion
            )
        
        # Generate assignment notes
        skill_balance_notes = self._generate_skill_balance_notes(assigned_team, project)
        diversity_notes = self._generate_diversity_notes(assigned_team)
        
        return TeamAssignment(
            project=project,
            consultants=assigned_team,
            conflict_notes=conflict_notes,
            diversity_notes=diversity_notes,
            skill_balance_notes=skill_balance_notes,
            estimated_completion_date=estimated_completion
        )

    def _generate_skill_balance_notes(self, team: List[Consultant], project: Project) -> str:
        """Generate notes about team skill balance"""
        team_skills = defaultdict(int)
        for consultant in team:
            for skill in consultant.skills:
                team_skills[skill] += 1
        
        required_skills_coverage = sum(1 for skill in project.required_skills 
                                     if skill in team_skills) / len(project.required_skills)
        
        return (f"Team covers {required_skills_coverage:.1%} of required skills. "
                f"Skill distribution: {dict(team_skills)}")

    def _generate_diversity_notes(self, team: List[Consultant]) -> str:
        """Generate notes about team diversity"""
        gender_dist = defaultdict(int)
        ethnicity_dist = defaultdict(int)
        
        for consultant in team:
            gender_dist[consultant.gender] += 1
            ethnicity_dist[consultant.ethnicity] += 1
        
        return (f"Gender distribution: {dict(gender_dist)}, "
                f"Ethnicity distribution: {dict(ethnicity_dist)}")
