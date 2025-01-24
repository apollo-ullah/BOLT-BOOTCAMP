from sqlalchemy import create_engine, text


def check_tables():
    """Check what tables exist in the database"""
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/postgres")

    # Query to list all tables in the current schema
    query = text(
        """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """
    )

    with engine.connect() as conn:
        result = conn.execute(query)
        print("\nExisting tables in database:")
        print("-" * 30)
        for row in result:
            print(row[0])


if __name__ == "__main__":
    check_tables()
