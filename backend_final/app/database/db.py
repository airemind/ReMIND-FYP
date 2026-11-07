from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config.settings import settings
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Configure engine with pool_pre_ping & recycle to gracefully handle Neon serverless auto-suspend
engine_kwargs = {"pool_pre_ping": True}
if not db_url.startswith("sqlite"):
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(db_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


import app.database.base
