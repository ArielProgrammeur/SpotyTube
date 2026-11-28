from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Configuration spécifique à SQLite
connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)


# Création du moteur SQLAlchemy
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)


# Fabrique de sessions
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

if settings.database_url.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(
        dbapi_connection,
        connection_record,
    ) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Classe mère de tous nos modèles SQL
class Base(DeclarativeBase):
    pass


# Dépendance FastAPI pour les sessions de base de données
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
