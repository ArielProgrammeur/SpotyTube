from fastapi import APIRouter


router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    """
    Vérifie que le service FastAPI fonctionne.
    """

    return {
        "status": "ok",
        "service": "spotytube-api",
    }