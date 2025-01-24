from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pandas as pd
from datetime import datetime
from typing import List

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    return psycopg2.connect(
        database="consultant_matcher",
        user="postgres",
        password="aullah6",
        host="localhost",
        port="5432",
    )


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
