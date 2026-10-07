from app.database.db import Base, engine

# Import ALL models
import app.database.base

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Done.")
