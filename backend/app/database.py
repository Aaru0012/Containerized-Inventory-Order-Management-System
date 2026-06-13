import os
import time
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to Docker-compose PostgreSQL URL, can be overridden by env variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/inventory_db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Attempt connecting to PostgreSQL
    retries = 3
    connected = False
    last_error = None
    
    # Check if we are running in a docker container or if we want to bypass PostgreSQL check
    # to avoid delay if we know postgres isn't running locally
    if os.getenv("BYPASS_DB_CHECK") == "true":
        engine = create_engine(DATABASE_URL)
    else:
        print(f"Connecting to database: {DATABASE_URL}")
        for i in range(retries):
            try:
                engine = create_engine(DATABASE_URL)
                connection = engine.connect()
                connection.close()
                connected = True
                print("Successfully connected to PostgreSQL database.")
                break
            except Exception as e:
                last_error = e
                print(f"PostgreSQL connection attempt {i+1} failed: {e}. Retrying in 2 seconds...")
                time.sleep(2)
        
        if not connected:
            print(f"Could not connect to PostgreSQL. Fallback to SQLite. Error: {last_error}")
            if os.getenv("VERCEL") == "1":
                DATABASE_URL = "sqlite:////tmp/local_inventory.db"
            else:
                DATABASE_URL = "sqlite:///./local_inventory.db"
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
