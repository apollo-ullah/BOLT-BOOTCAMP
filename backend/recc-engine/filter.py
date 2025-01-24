from typing import List, Dict, Any
import pandas as pd
from datetime import datetime


class FirstPhaseFilter:
    def __init__(self):
        """Initialize the first phase filter with necessary configurations"""
        self.required_fields = [
            "current_availability",
            "location_flexibility",
            "seniority_level",
            "skill1",
            "skill2",
            "skill3",
            "years_of_experience",
            "preferred_industries",
        ]

    def _check_availability(
        self, consultant: Dict[str, Any], project_start_date: str
    ) -> bool:
        """Check if consultant is available for the project start date"""
        return consultant["current_availability"] == True

    def _check_location_match(
        self, consultant: Dict[str, Any], project_location: str
    ) -> bool:
        """Check if consultant's location preference matches project location"""
        if consultant["location_flexibility"] == True:
            return True
        # If project is remote, everyone matches
        if project_location.lower() == "remote":
            return True
        # Otherwise, check if locations match
        return consultant["location"] == project_location

    def _check_skills_match(
        self, consultant: Dict[str, Any], required_skills: List[str]
    ) -> bool:
        """Check if consultant has the required skills"""
        consultant_skills = {
            consultant["skill1"].lower(),
            consultant["skill2"].lower(),
            consultant["skill3"].lower(),
        }
        required_skills_set = {skill.lower() for skill in required_skills}

        # Must match at least 2 required skills
        matches = len(consultant_skills.intersection(required_skills_set))
        return matches >= 2

    def _check_experience_level(
        self, consultant: Dict[str, Any], project_difficulty: str
    ) -> bool:
        """Check if consultant's experience level matches project difficulty"""
        experience_years = consultant["years_of_experience"]

        if project_difficulty.lower() == "expert":
            return experience_years >= 8
        elif project_difficulty.lower() == "hard":
            return experience_years >= 5
        elif project_difficulty.lower() == "medium":
            return experience_years >= 3
        else:  # easy
            return True

    def _check_industry_match(
        self, consultant: Dict[str, Any], project_industry: str
    ) -> bool:
        """Check if consultant's preferred industries match project industry"""
        consultant_industries = set(
            consultant["preferred_industries"].lower().split(",")
        )
        return project_industry.lower() in consultant_industries

    def apply_first_layer(
        self, consultants: List[Dict[str, Any]], project: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply first layer of filtering based on hard requirements"""
        filtered_consultants = []

        for consultant in consultants:
            # Check all required fields exist
            if not all(field in consultant for field in self.required_fields):
                continue

            # Apply all hard filters
            if (
                self._check_availability(consultant, project["start_date"])
                and self._check_location_match(consultant, project["location_city"])
                and self._check_skills_match(
                    consultant,
                    [
                        project["required_skill1"],
                        project["required_skill2"],
                        project["required_skill3"],
                    ],
                )
                and self._check_experience_level(consultant, project["difficulty"])
                and self._check_industry_match(
                    consultant, project["preferred_industry"]
                )
            ):
                filtered_consultants.append(consultant)

        return filtered_consultants

    def score_second_layer(
        self, consultants: List[Dict[str, Any]], project: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Score consultants based on weighted criteria to get top matches"""
        scored_consultants = []

        for consultant in consultants:
            score = 0

            # Skills match score (0-30 points)
            consultant_skills = {
                consultant["skill1"].lower(),
                consultant["skill2"].lower(),
                consultant["skill3"].lower(),
            }
            required_skills = {
                project["required_skill1"].lower(),
                project["required_skill2"].lower(),
                project["required_skill3"].lower(),
            }
            skills_match = len(consultant_skills.intersection(required_skills))
            score += (skills_match / 3) * 30

            # Experience score (0-25 points)
            experience_years = consultant["years_of_experience"]
            if project["difficulty"].lower() == "expert":
                score += min(experience_years / 10, 1) * 25
            elif project["difficulty"].lower() == "hard":
                score += min(experience_years / 8, 1) * 25
            else:
                score += min(experience_years / 5, 1) * 25

            # Industry match score (0-20 points)
            consultant_industries = set(
                consultant["preferred_industries"].lower().split(",")
            )
            if project["preferred_industry"].lower() in consultant_industries:
                score += 20

            # Location score (0-15 points)
            if consultant["location_flexibility"]:
                score += 15
            elif project["location_city"].lower() == "remote":
                score += 15
            elif consultant["location"] == project["location_city"]:
                score += 15

            # Availability score (0-10 points)
            if consultant["current_availability"]:
                score += 10

            consultant["match_score"] = round(score, 2)
            scored_consultants.append(consultant)

        # Sort by score in descending order
        scored_consultants.sort(key=lambda x: x["match_score"], reverse=True)

        # Return top 10 matches
        return scored_consultants[:10]

    def get_top_matches(
        self, consultants: List[Dict[str, Any]], project: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get top consultant matches for a project using two-layer filtering"""
        # First layer: Hard requirements filter
        first_layer_matches = self.apply_first_layer(consultants, project)

        # Second layer: Scoring and ranking
        top_matches = self.score_second_layer(first_layer_matches, project)

        return top_matches
