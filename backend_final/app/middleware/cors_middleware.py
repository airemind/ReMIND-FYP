from app.config.settings import settings
from fastapi.middleware.cors import CORSMiddleware


def setup_cors(app):
    # Build origins list from env vars, filter out any blanks
    raw_origins = [
        settings.REACT_BASE_URL,
        settings.REACT_BASE_URL_ALTERNATIVE,
    ]
    allow_origins = [o.strip() for o in raw_origins if o and o.strip()]

    # Fallback to allow all during local dev (when no origins are configured)
    if not allow_origins:
        allow_origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
