import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("postgres"):
    # Convert postgres:// to postgresql:// for SQLAlchemy
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Configure connection arguments
    connect_args = {}
    
    ca_cert_path = os.environ.get("DB_CA_CERT_PATH")
    if ca_cert_path and os.path.exists(ca_cert_path):
        connect_args["sslrootcert"] = ca_cert_path
        
    if "sslmode=require" in SQLALCHEMY_DATABASE_URL:
        connect_args["sslmode"] = "require"
        # SQLAlchemy URL shouldn't have query params processed directly for SSL mode by connect_args usually,
        # but passing it via connect_args is safe. The string replace could also be done if `sslmode` causes issues.

    if connect_args:
        engine_kwargs["connect_args"] = connect_args
        
    db_connection_limit = int(os.environ.get("DB_CONNECTION_LIMIT", 20))
    engine_kwargs["pool_size"] = db_connection_limit
    engine_kwargs["max_overflow"] = 10

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
