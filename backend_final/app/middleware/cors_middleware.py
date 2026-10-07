from app.config.settings import settings
from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app):
    # Base origins including deployed frontend and local development
    origins_candidates = [
        "https://remind-frontend.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.REACT_BASE_URL,
        settings.REACT_BASE_URL_ALTERNATIVE,
    ]

    # Clean and strip trailing slashes (browsers send Origin without trailing slash)
    allow_origins = list({
        o.strip().rstrip("/")
        for o in origins_candidates
        if o and o.strip()
    })

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
