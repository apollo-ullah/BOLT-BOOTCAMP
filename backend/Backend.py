from dataclasses import dataclass
from typing import List, Dict, Set
from datetime import date
from enum import Enum
import random
from collections import defaultdict

class DifficultyLevel(Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

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
    conflicts: List[str]  # List of consultant IDs they cannot work with
    performance_rating: int  # 1-10
    current_workload: int  # 0-100%

@dataclass
class Project:
    project_id: str
    name: str
    required_skills: List[str]
    required_expertise: List[str]
    difficulty_level: DifficultyLevel
    team_size: int
    timeline: date

@dataclass
class TeamAssignment:
    project: Project
    consultants: List[Consultant]
    conflict_notes: List[str]
    diversity_notes: str
    skill_balance_notes: str

class ConsultantMatcher:
    def __init__(self):
        # Base weights for different factors
        self.EXPERIENCE_WEIGHT = 0.40
        self.SKILL_DIVERSITY_WEIGHT = 0.20
        self.DEMOGRAPHIC_DIVERSITY_WEIGHT = 0.15
        self.AVAILABILITY_WEIGHT = 0.15
        self.PREFERENCES_WEIGHT = 0.10

    def calculate_experience_score(self, consultant: Consultant, project: Project) -> float:
        """Calculate experience score based on years of experience and skill match"""
        skill_match = len(set(consultant.skills) & set(project.required_skills))
        expertise_match = len(set(consultant.expertise) & set(project.required_expertise))
        
        # Normalize scores
        skill_score = skill_match / max(len(project.required_skills), 1)
        expertise_score = expertise_match / max(len(project.required_expertise), 1)
        experience_score = min(consultant.years_experience / 10, 1)  # Cap at 10 years
        
        return (skill_score + expertise_score + experience_score) / 3

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

        # Calculate current team demographics
        gender_ratio = defaultdict(int)
        ethnicity_ratio = defaultdict(int)
        
        for member in current_team:
            gender_ratio[member.gender] += 1
            ethnicity_ratio[member.ethnicity] += 1

        # Check if candidate would improve balance
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

    def calculate_availability_score(self, consultant: Consultant) -> float:
        """Calculate availability score based on current workload and availability"""
        if not consultant.availability:
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
        
        # Create a copy of consultants to avoid modifying the original list
        candidates = [c for c in available_consultants if c.availability]
        
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
                availability_score = self.calculate_availability_score(candidate)
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
        
        # Generate assignment notes
        skill_balance_notes = self._generate_skill_balance_notes(assigned_team, project)
        diversity_notes = self._generate_diversity_notes(assigned_team)
        
        return TeamAssignment(
            project=project,
            consultants=assigned_team,
            conflict_notes=conflict_notes,
            diversity_notes=diversity_notes,
            skill_balance_notes=skill_balance_notes
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
