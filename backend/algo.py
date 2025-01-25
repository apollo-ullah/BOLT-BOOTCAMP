# algo.py
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Tuple

# Map project difficulty to acceptable roles.
# If your consultant table uses different naming or you wish to include 'expert' in certain difficulties,
# adjust accordingly.
DIFFICULTY_ROLES = {
    "easy":   ["intern", "junior", "mid-level", "senior", "expert"],  # Any role can do easy projects
    "medium": ["junior", "mid-level", "senior", "expert"],            # Junior and above
    "hard":   ["mid-level", "senior", "expert"],                      # Mid-level and above
    "expert": ["senior", "expert"]                                    # Only senior and expert
}

def filter_consultants_phase1(consultants: List[Dict[str, Any]], project: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Phase 1: Filter consultants by role suitability and availability
    """
    print(f"\nDEBUG: Starting Phase 1 filtering")
    print(f"DEBUG: Total consultants before filtering: {len(consultants)}")
    print(f"DEBUG: Project difficulty: {project['difficulty']}")
    
    # Get relevant roles for project difficulty
    difficulty = project["difficulty"].lower()
    relevant_roles = DIFFICULTY_ROLES.get(difficulty, [])
    print(f"DEBUG: Relevant roles for {difficulty}: {relevant_roles}")

    # Convert project dates to date objects
    project_start = _ensure_date(project["start_date"])
    project_end = _ensure_date(project["end_date"])
    print(f"DEBUG: Project dates: {project_start} to {project_end}")

    filtered_consultants = []
    for c in consultants:
        print(f"\nDEBUG: Checking consultant {c.get('first_name')} {c.get('last_name')}")
        consultant_level = (c.get('seniority_level') or '').lower()
        print(f"DEBUG: Seniority level: {consultant_level}")

        # 1) Check difficulty → role mapping
        if consultant_level not in relevant_roles:
            print(f"DEBUG: '{consultant_level}' not in {relevant_roles}")
            continue

        # 2) Check availability format: "<YYYY-MM-DD> to <YYYY-MM-DD>"
        availability_str = c.get('current_availability', '')
        if not availability_str or ' to ' not in availability_str:
            print(f"DEBUG: Invalid availability format: '{availability_str}'")
            continue

        try:
            avail_start_str, avail_end_str = availability_str.split(' to ')
            avail_start = _ensure_date(avail_start_str.strip())
            avail_end = _ensure_date(avail_end_str.strip())
        except ValueError as e:
            print(f"DEBUG: Error parsing availability dates: {e}")
            continue

        # 3) Check if the consultant is available for the entire project duration
        if avail_start <= project_start and avail_end >= project_end:
            print(f"DEBUG: Consultant is available: {avail_start} to {avail_end}")
            filtered_consultants.append(c)
        else:
            print(f"DEBUG: Consultant availability ({avail_start} to {avail_end}) "
                  f"doesn't match project dates ({project_start} to {project_end})")

    print(f"\nDEBUG: Consultants remaining after Phase 1: {len(filtered_consultants)}")
    return filtered_consultants


def refine_consultants_phase2(filtered_consultants, project):
    """
    Phase 2:
    Further refine and narrow down to 10 consultants based on custom logic:
      - Skill matching
      - Industry experience
      - Location matching
    """
    print(f"\nDEBUG: Starting Phase 2 refinement")
    print(f"DEBUG: Number of consultants to refine: {len(filtered_consultants)}")
    
    scored = []
    required_skills = [
        s.lower() for s in [
            project["required_skill1"], 
            project.get("required_skill2"), 
            project.get("required_skill3")
        ] 
        if s
    ]
    print(f"DEBUG: Required skills: {required_skills}")
    preferred_industry = project["preferred_industry"].lower()
    print(f"DEBUG: Preferred industry: {preferred_industry}")

    for c in filtered_consultants:
        print(f"\nDEBUG: Scoring consultant {c.get('first_name')} {c.get('last_name')}")
        score = 0
        reasons = []

        # 1. Skill matching (50% of total score)
        consultant_skills = [
            s.lower() for s in [
                c.get("skill1"),
                c.get("skill2"),
                c.get("skill3")
            ] 
            if s
        ]
        print(f"DEBUG: Consultant skills: {consultant_skills}")
        
        # Count exact and partial skill matches
        skill_matches = 0
        for rs in required_skills:
            for cs in consultant_skills:
                if rs == cs:  # Exact match
                    skill_matches += 1
                    print(f"DEBUG: Found exact skill match: {rs}")
                    break
                elif rs in cs or cs in rs:  # Partial match
                    skill_matches += 0.5
                    print(f"DEBUG: Found partial skill match: {rs} - {cs}")
                    break
        
        if skill_matches > 0:
            score += (skill_matches / len(required_skills)) * 0.5  # Up to 50% of total score
            reasons.append(f"Matched {skill_matches} required skill(s)")
            print(f"DEBUG: Skill score contribution: {(skill_matches / len(required_skills)) * 0.5}")

        # 2. Industry match (30% of total score)
        consultant_industry = c.get("past_project_industry", "").lower()
        print(f"DEBUG: Consultant industry: {consultant_industry}")
        if preferred_industry in consultant_industry or consultant_industry in preferred_industry:
            score += 0.3
            reasons.append("Has experience in the required industry")
            print("DEBUG: Full industry match")
        elif any(word in consultant_industry for word in preferred_industry.split()):
            score += 0.15
            reasons.append("Has experience in a related industry")
            print("DEBUG: Partial industry match")

        # 3. Location preference (20% of total score)
        print(f"DEBUG: Location flexibility: {c.get('location_flexibility')}")
        print(f"DEBUG: Consultant country: {c.get('location_country')}")
        print(f"DEBUG: Project country: {project.get('location_country')}")
        if c.get("location_flexibility", "").lower() == "flexible":
            score += 0.2
            reasons.append("Flexible with location")
            print("DEBUG: Location score from flexibility")
        elif (c.get("location_country", "").lower() == project.get("location_country", "").lower()):
            score += 0.2
            reasons.append("Local to project country")
            print("DEBUG: Location score from country match")

        # Save with normalized score (0-1 range)
        print(f"DEBUG: Final score: {score}")
        scored.append({
            "consultant": c,
            "score": round(score, 2),
            "reasons": reasons
        })

    # Sort by score descending
    scored.sort(key=lambda x: x["score"], reverse=True)
    print(f"\nDEBUG: Final number of matches: {len(scored)}")
    return scored[:10]

def _ensure_date(d) -> date:
    """Utility: parse or convert various date formats to a date object."""
    if isinstance(d, date):
        return d
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, str):
        return datetime.strptime(d, "%Y-%m-%d").date()
    raise ValueError(f"Unsupported date type: {type(d)} => {d}")

def _valid_lowered_skills(*skills) -> List[str]:
    """
    Gather given skill strings, convert to lowercase, and filter out None or empty.
    """
    return [s.strip().lower() for s in skills if s and isinstance(s, str)]
