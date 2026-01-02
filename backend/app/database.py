from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from pathlib import Path
import socket

BASE_DIR = Path(__file__).parent.parent
env_path = BASE_DIR / ".env"

# Load .env if it exists
if env_path.exists():
    load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
USE_SQLITE_FALLBACK = False

# If no DATABASE_URL is set, use SQLite as fallback (no setup required)
if not DATABASE_URL:
    sqlite_db_path = BASE_DIR / "ecoimpact.db"
    DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    USE_SQLITE_FALLBACK = True
    print(f"[INFO] No DATABASE_URL found in .env, using SQLite database: {sqlite_db_path}")
    print("[INFO] To use PostgreSQL, set DATABASE_URL in backend/.env file")

def test_dns_resolution(hostname):
    """Test if hostname can be resolved"""
    try:
        socket.gethostbyname(hostname)
        return True
    except socket.gaierror:
        return False

if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    hostname = None
    try:
        if "@" in DATABASE_URL:
            hostname = DATABASE_URL.split("@")[1].split(":")[0].split("/")[0]
            if hostname not in ["localhost", "127.0.0.1"] and not test_dns_resolution(hostname):
                print(f"WARNING: Cannot resolve hostname '{hostname}'")
                print("This may be a DNS or network issue.")
                print("Solutions:")
                print("1. Check your internet connection")
                print("2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)")
                print("3. Check if firewall/antivirus is blocking connections")
                print("4. Try using a VPN or different network")
                print("5. Consider using a local database for demos (see LOCAL_DATABASE_SETUP.md)")
                print("See SETUP_GUIDE.md for detailed troubleshooting steps.")
    except Exception:
        pass
    
    if "sslmode" not in DATABASE_URL.lower():
        if hostname and hostname not in ["localhost", "127.0.0.1"]:
            if "?" in DATABASE_URL:
                DATABASE_URL += "&sslmode=require"
            else:
                DATABASE_URL += "?sslmode=require"

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},  # Required for SQLite with FastAPI
        echo=False
    )
    print("[OK] Using SQLite database (no setup required)")
else:
    # PostgreSQL configuration - try to connect, fallback to SQLite if fails
    try:
        # Test PostgreSQL connection with a short timeout
        test_engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"connect_timeout": 3} if "postgresql" in DATABASE_URL.lower() or "postgres" in DATABASE_URL.lower() else {}
        )
        # Try to connect
        with test_engine.connect() as conn:
            conn.execute("SELECT 1")
        # Connection successful, use PostgreSQL
        engine = test_engine
        print("[OK] Using PostgreSQL database")
    except Exception as e:
        # PostgreSQL connection failed, fallback to SQLite
        print(f"[WARNING] PostgreSQL connection failed: {str(e)[:100]}")
        print("[INFO] Falling back to SQLite database (no setup required)")
        sqlite_db_path = BASE_DIR / "ecoimpact.db"
        DATABASE_URL = f"sqlite:///{sqlite_db_path}"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
        USE_SQLITE_FALLBACK = True
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created/verified successfully")
    except Exception as e:
        print(f"[WARNING] Database initialization warning: {e}")
        # For SQLite, this should always work, so re-raise if it's SQLite
        if DATABASE_URL.startswith("sqlite"):
            raise
        # For PostgreSQL, allow it to continue (connection might be temporary)
        print("[WARNING] Database connection issue - some features may not work until database is available")

