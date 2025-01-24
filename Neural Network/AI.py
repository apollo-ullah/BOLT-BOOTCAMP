import re
import numpy as np
from datetime import datetime
from typing import List, Dict, Any

class ThreePhaseMatcher:
    def __init__(self):
        """
        Initialize any placeholders for the multi-phase "neural network."
        In real usage, you might have actual neural models in these phases.
        """
        # Phase 1: Filtering logic (placeholder for a real model)
        self.filter_network = None

        # Phase 2: Matching logic (placeholder for a real model)
        self.match_network = None

        # Tweak these weights as desired:
        self.weights = {
            "location": 0.1,            # if project is NOT in Montreal; else 0
            "skills": 0.5,
            "past_industry": 0.3,
            "difficulty_experience": 0.1,
        }

    ############################################################################
    # PHASE 1: FILTERING
    ############################################################################

    def date_overlap(
        self,
        proj_start: datetime,
        proj_end: datetime,
        consultant_start: datetime,
        consultant_end: datetime,
    ) -> bool:
        """
        True if the consultant is available throughout the entire project window.
        Requires FULL coverage (consultant_start <= proj_start and
        consultant_end >= proj_end).
        """
        return (consultant_start <= proj_start) and (consultant_end >= proj_end)

    def filter_phase(self, project: Dict[str, Any], consultant: Dict[str, Any]) -> bool:
        """
        Phase 1: Basic filtering:
          - Check date availability
          - (You could also do location-based filtering here, if needed)
        Returns True if the consultant passes the filter, otherwise False.
        """
        # Parse project start/end
        proj_start = datetime.strptime(project["start_date"], "%Y-%m-%d")
        proj_end   = datetime.strptime(project["end_date"],   "%Y-%m-%d")

        # Parse consultant availability
        c_start_str, c_end_str = consultant["current_availability"].split(" to ")
        cons_start = datetime.strptime(c_start_str.strip(), "%Y-%m-%d")
        cons_end   = datetime.strptime(c_end_str.strip(),   "%Y-%m-%d")

        # Check if consultant covers the entire project window
        if not self.date_overlap(proj_start, proj_end, cons_start, cons_end):
            return False

        # Since all have a Canadian work permit, we skip extra location filtering.
        return True

    ############################################################################
    # PHASE 2: MATCHING
    ############################################################################

    def partial_skill_match(self, required_skill: str, consultant_skill: str) -> float:
        """
        Naive partial matching:
         - Lowercase both strings
         - Split into tokens
         - Count overlapping tokens
         - Return ratio in [0..1]
        """
        req_tokens = set(re.findall(r"\w+", required_skill.lower()))
        con_tokens = set(re.findall(r"\w+", consultant_skill.lower()))
        if not req_tokens or not con_tokens:
            return 0.0
        overlap = req_tokens.intersection(con_tokens)
        return len(overlap) / len(req_tokens)

    def compute_skill_score(self, project: Dict[str, Any], consultant: Dict[str, Any]) -> float:
        """
        Compare project's required skills vs. consultant's 3 skills using partial matching.
        We average the best match for each required skill.
        """
        required = [
            project["required_skill1"],
            project["required_skill2"],
            project["required_skill3"],
        ]
        has = [
            consultant["skill1"],
            consultant["skill2"],
            consultant["skill3"],
        ]

        scores = []
        for req_skill in required:
            best = 0.0
            for cons_skill in has:
                match_val = self.partial_skill_match(req_skill, cons_skill)
                if match_val > best:
                    best = match_val
            scores.append(best)

        return float(np.mean(scores))

    def compute_past_industry_score(self, project: Dict[str, Any], consultant: Dict[str, Any]) -> float:
        """
        Returns 1 if project['preferred_industry'] matches consultant['past_project_industry'], else 0.
        """
        if project["preferred_industry"].strip().lower() == consultant["past_project_industry"].strip().lower():
            return 1.0
        else:
            return 0.0

    def compute_location_score(self, project: Dict[str, Any]) -> float:
        """
        If project location is Montreal => location weight is 0 (phase usage).
        We'll return 1.0 if not Montreal (meaning "ok for location"), but multiply by 0.1 or 0.0 accordingly.
        """
        if project["Location"].strip().lower() == "montreal":
            return 1.0  # but will multiply by 0
        else:
            return 1.0  # multiply by 0.1

    def compute_difficulty_experience_score(self, project: Dict[str, Any], consultant: Dict[str, Any]) -> float:
        """
        Compare project difficulty (1..4) with scaled experience (0..4).
        Return 1 if perfect, else proportionally less.
        """
        difficulty_map = {"easy": 1, "medium": 2, "hard": 3, "expert": 4}
        proj_diff = difficulty_map.get(project["difficulty"].strip().lower(), 2)
        yrs = consultant["years_of_experience"]

        # Scale up to 4 max (10+ yrs considered enough for expert).
        scale_exp = min(yrs / 10 * 4, 4)
        diff = abs(scale_exp - proj_diff)
        return max(1.0 - (diff / 4.0), 0.0)

    def matching_phase(self, project: Dict[str, Any], consultant: Dict[str, Any]) -> float:
        """
        Phase 2: Weighted scoring:
          - Location (unless Montreal => weight=0)
          - Skills
          - Past project industry
          - Difficulty vs. Experience
        """
        location_score = self.compute_location_score(project)
        skill_score    = self.compute_skill_score(project, consultant)
        industry_score = self.compute_past_industry_score(project, consultant)
        diff_exp_score = self.compute_difficulty_experience_score(project, consultant)

        # If project is in Montreal => location weight = 0
        if project["Location"].strip().lower() == "montreal":
            w_location = 0.0
        else:
            w_location = self.weights["location"]

        total = (
            w_location * location_score
            + self.weights["skills"] * skill_score
            + self.weights["past_industry"] * industry_score
            + self.weights["difficulty_experience"] * diff_exp_score
        )

        return total

    ############################################################################
    # MATCH CONSULTANTS TO PROJECT
    ############################################################################

    def match_consultants_to_project(self, 
                                     project: Dict[str, Any], 
                                     consultants: List[Dict[str, Any]], 
                                     top_n: int = 3
                                    ) -> Dict[str, Any]:
        """
        Runs:
          1) Filter out unavailable consultants.
          2) Calculate weighted “neural network” style score.
        Returns the top N matches sorted by descending score.
        """
        # PHASE 1: Filter
        valid_consultants = []
        for c in consultants:
            if self.filter_phase(project, c):
                valid_consultants.append(c)

        # If none pass, return empty
        if not valid_consultants:
            return {
                "project_id": project["id"],
                "project_name": project["project_name"],
                "top_matches": [],
            }

        # PHASE 2: Score
        results = []
        for c in valid_consultants:
            base_score = self.matching_phase(project, c)
            results.append({
                "consultant_id": c["id"],
                "consultant_name": f"{c['first_name']} {c['last_name']}",
                "base_score": round(base_score, 4),
            })

        # Sort by base_score descending
        results.sort(key=lambda x: x["base_score"], reverse=True)

        # Take top N
        top_matches = results[:top_n]

        return {
            "project_id": project["id"],
            "project_name": project["project_name"],
            "top_matches": top_matches,
        }

############################################################################
# EXAMPLE USAGE
############################################################################

if __name__ == "__main__":
    # Example project data
    projects = [
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

    # Example consultant data
    consultants = [
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
            "current_availability": "2024-08-30 to 2024-11-28",
            "location_flexibility": "Valid UK Visa",
            "past_project_industry": "Aerospace Engineering",
        },
    ]

    matcher = ThreePhaseMatcher()

    # Get top 3 matches for each project
    for proj in projects:
        result = matcher.match_consultants_to_project(proj, consultants, top_n=3)
        print(f"\nPROJECT: {proj['project_name']} (ID: {proj['id']})")
        if not result["top_matches"]:
            print("  No matching consultants found!")
        else:
            for rank, match in enumerate(result["top_matches"], start=1):
                print(
                    f"  {rank}. Consultant {match['consultant_name']} "
                    f"-> Score: {match['base_score']}"
                )
