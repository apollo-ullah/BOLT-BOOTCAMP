from sqlalchemy import create_engine, text
from typing import List, Dict, Any
import os


class Database:
    def __init__(self):
        """Initialize database connection"""
        self.engine = create_engine(
            "postgresql://postgres:postgres@localhost:5432/postgres"
        )

    def get_all_consultants(self) -> List[Dict[str, Any]]:
        """Fetch all consultants from the database"""
        query = text(
            """
            SELECT 
                id,
                first_name,
                last_name,
                current_availability,
                location_flexibility,
                seniority_level,
                skill1,
                skill2,
                skill3,
                years_of_experience,
                preferred_industries,
                location
            FROM consultants
        """
        )

        with self.engine.connect() as conn:
            result = conn.execute(query)
            consultants = []
            for row in result:
                consultant = dict(row._mapping)
                # Convert to boolean
                consultant["current_availability"] = bool(
                    consultant["current_availability"]
                )
                consultant["location_flexibility"] = bool(
                    consultant["location_flexibility"]
                )
                consultants.append(consultant)
            return consultants

    def get_project_by_id(self, project_id: int) -> Dict[str, Any]:
        """Fetch a specific project from the database"""
        query = text(
            """
            SELECT 
                id,
                project_name,
                preferred_industry,
                start_date,
                end_date,
                location_city,
                difficulty,
                required_skill1,
                required_skill2,
                required_skill3
            FROM projects
            WHERE id = :project_id
        """
        )

        with self.engine.connect() as conn:
            result = conn.execute(query, {"project_id": project_id})
            project = dict(result.fetchone()._mapping)
            return project

    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Fetch all projects from the database"""
        query = text(
            """
            SELECT 
                id,
                project_name,
                preferred_industry,
                start_date,
                end_date,
                location_city,
                difficulty,
                required_skill1,
                required_skill2,
                required_skill3
            FROM projects
        """
        )

        with self.engine.connect() as conn:
            result = conn.execute(query)
            projects = [dict(row._mapping) for row in result]
            return projects
