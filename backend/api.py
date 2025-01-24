from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime
from typing import List
from pydantic import BaseModel
import traceback

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="consultant_matcher",
            user="adyanullah",
            password="postgres",
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")


@app.get("/consultants")
async def get_consultants():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM consultants")
    consultants = cur.fetchall()
    cur.close()
    conn.close()
    return consultants


@app.get("/projects")
async def get_projects():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM projects")
    projects = cur.fetchall()
    cur.close()
    conn.close()
    return projects


@app.get("/check-tables")
async def check_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """
    )
    tables = cur.fetchall()
    cur.close()
    conn.close()
    return {"tables": [table[0] for table in tables]}


@app.get("/project-count")
async def get_project_count():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM projects")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {"count": count}


class ProjectCreate(BaseModel):
    project_name: str
    preferred_industry: str
    start_date: str
    end_date: str
    location_city: str
    location_country: str
    difficulty: str
    description: str
    required_skill1: str
    required_skill2: str
    required_skill3: str


@app.post("/projects")
async def create_project(
    project: ProjectCreate,
):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        start_date = datetime.strptime(project.start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(project.end_date, "%Y-%m-%d").date()

        print("Attempting to insert project:", project.dict())

        cur.execute(
            """
            INSERT INTO projects (
                project_name, preferred_industry, start_date, end_date,
                location_city, location_country, difficulty, description,
                required_skill1, required_skill2, required_skill3
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) RETURNING *;
            """,
            (
                project.project_name,
                project.preferred_industry,
                start_date,
                end_date,
                project.location_city,
                project.location_country,
                project.difficulty.lower(),
                project.description,
                project.required_skill1,
                project.required_skill2,
                project.required_skill3,
            ),
        )
        new_project = cur.fetchone()
        conn.commit()
        return new_project
    except ValueError as e:
        print("ValueError:", str(e))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format. Please use YYYY-MM-DD. Error: {str(e)}",
        )
    except Exception as e:
        print("Error creating project:", str(e))
        print("Traceback:", traceback.format_exc())
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create project: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()


class ProjectUpdate(ProjectCreate):
    pass


@app.put("/projects/{project_id}")
async def update_project(
    project_id: int,
    project: ProjectUpdate,
):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # First check if project exists
        cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        existing_project = cur.fetchone()
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        start_date = datetime.strptime(project.start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(project.end_date, "%Y-%m-%d").date()

        cur.execute(
            """
            UPDATE projects SET
                project_name = %s,
                preferred_industry = %s,
                start_date = %s,
                end_date = %s,
                location_city = %s,
                location_country = %s,
                difficulty = %s,
                description = %s,
                required_skill1 = %s,
                required_skill2 = %s,
                required_skill3 = %s
            WHERE id = %s
            RETURNING *;
            """,
            (
                project.project_name,
                project.preferred_industry,
                start_date,
                end_date,
                project.location_city,
                project.location_country,
                project.difficulty.lower(),
                project.description,
                project.required_skill1,
                project.required_skill2,
                project.required_skill3,
                project_id,
            ),
        )
        updated_project = cur.fetchone()
        conn.commit()
        return updated_project
    except ValueError as e:
        print("ValueError:", str(e))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format. Please use YYYY-MM-DD. Error: {str(e)}",
        )
    except Exception as e:
        print("Error updating project:", str(e))
        print("Traceback:", traceback.format_exc())
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update project: {str(e)}"
        )
    finally:
        cur.close()
        conn.close()


@app.delete("/projects/{project_id}")
async def delete_project(project_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # First check if project exists
        cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        existing_project = cur.fetchone()
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Delete the project
        cur.execute("DELETE FROM projects WHERE id = %s RETURNING *", (project_id,))
        deleted_project = cur.fetchone()
        conn.commit()
        return deleted_project
    except Exception as e:
        print("Error deleting project:", str(e))
        print("Traceback:", traceback.format_exc())
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")
    finally:
        cur.close()
        conn.close()


class ConsultantMatch(BaseModel):
    consultant: dict
    match_score: float
    match_reasons: List[str]

@app.get("/recommend-consultants/{project_id}")
async def recommend_consultants(project_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Get project details
        cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        project = cur.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get all consultants
        cur.execute("SELECT * FROM consultants")
        consultants = cur.fetchall()

        # Calculate matches
        matches = []
        for consultant in consultants:
            match_score = 0.0
            match_reasons = []

            # Check skill matches
            project_skills = [
                project['required_skill1'].lower(),
                project['required_skill2'].lower() if project['required_skill2'] else None,
                project['required_skill3'].lower() if project['required_skill3'] else None
            ]
            consultant_skills = [
                consultant['skill1'].lower(),
                consultant['skill2'].lower() if consultant['skill2'] else None,
                consultant['skill3'].lower() if consultant['skill3'] else None
            ]

            skill_matches = sum(
                1 for ps in project_skills if ps and any(cs and ps in cs for cs in consultant_skills)
            )
            
            if skill_matches > 0:
                score_boost = skill_matches / len([s for s in project_skills if s])
                match_score += score_boost * 0.5  # Skills are 50% of the score
                match_reasons.append(f"Matches {skill_matches} required skills")

            # Check industry match
            if project['preferred_industry'].lower() in (consultant['past_project_industry'] or '').lower():
                match_score += 0.3  # Industry match is 30% of the score
                match_reasons.append("Has experience in the required industry")

            # Check seniority based on project difficulty
            difficulty_seniority_map = {
                'easy': ['junior', 'mid-level', 'senior', 'expert'],
                'medium': ['mid-level', 'senior', 'expert'],
                'hard': ['senior', 'expert'],
                'expert': ['expert']
            }
            
            if consultant['seniority_level'].lower() in difficulty_seniority_map[project['difficulty'].lower()]:
                match_score += 0.2  # Seniority match is 20% of the score
                match_reasons.append(f"Seniority level ({consultant['seniority_level']}) matches project difficulty")

            # Only include consultants with a match score above 0.3
            if match_score >= 0.3:
                matches.append({
                    "consultant": consultant,
                    "match_score": match_score,
                    "match_reasons": match_reasons
                })

        # Sort matches by score
        matches.sort(key=lambda x: x['match_score'], reverse=True)

        # Return top 5 matches
        return matches[:5]

    except Exception as e:
        print("Error recommending consultants:", str(e))
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/projects/{project_id}")
async def get_project(project_id: int):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
        project = cur.fetchone()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except Exception as e:
        print("Error fetching project:", str(e))
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}")
    finally:
        cur.close()
        conn.close()
