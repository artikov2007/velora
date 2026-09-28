from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionFactory
from app.modules.catalog.router import router as catalog_router


def create_app(session_factory=SessionFactory) -> FastAPI:
    application = FastAPI(
        title="VELORA API",
        version="0.1.0",
        description="Versioned API for the VELORA regional marketplace.",
    )
    application.state.session_factory = session_factory
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    application.include_router(catalog_router)

    @application.get("/healthz", tags=["system"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()