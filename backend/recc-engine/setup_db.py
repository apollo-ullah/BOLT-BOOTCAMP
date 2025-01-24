from sqlalchemy import create_engine, text


def setup_database():
    """Set up the database tables"""
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")

    # Create consultants table
    create_consultants = text(
        """
        CREATE TABLE IF NOT EXISTS consultants (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(255),
            current_availability BOOLEAN DEFAULT true,
            location_flexibility BOOLEAN DEFAULT false,
            seniority_level VARCHAR(50),
            skill1 VARCHAR(100),
            skill2 VARCHAR(100),
            skill3 VARCHAR(100),
            years_of_experience INTEGER,
            preferred_industries TEXT,
            location VARCHAR(100)
        )
    """
    )

    # Create projects table
    create_projects = text(
        """
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            project_name VARCHAR(255),
            preferred_industry VARCHAR(100),
            start_date DATE,
            end_date DATE,
            location_city VARCHAR(100),
            difficulty VARCHAR(50),
            required_skill1 VARCHAR(100),
            required_skill2 VARCHAR(100),
            required_skill3 VARCHAR(100)
        )
    """
    )

    with engine.connect() as conn:
        # Create tables
        print("Creating tables...")
        conn.execute(create_consultants)
        conn.execute(create_projects)
        conn.commit()
        print("Tables created successfully!")

        # Check if tables are empty
        result = conn.execute(text("SELECT COUNT(*) FROM consultants"))
        consultant_count = result.scalar()

        result = conn.execute(text("SELECT COUNT(*) FROM projects"))
        project_count = result.scalar()

        print(f"\nCurrent data in database:")
        print(f"Consultants: {consultant_count}")
        print(f"Projects: {project_count}")


if __name__ == "__main__":
    setup_database()
