from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.project_name,
    description="Backend de l'application SpotyTube.",
    version="0.1.0",
    debug=settings.debug,
)

app.include_router(
    api_router,
    prefix=settings.api_v1_prefix,
)


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    return {
        "message": "Bienvenue sur SpotyTube API",
        "documentation": "/docs",
        "health": f"{settings.api_v1_prefix}/health",
    }
