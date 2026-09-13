import os
import pytest
import pytest_asyncio
from app.core.database import init_db, engine, Base
from app.core.limiter import limiter

limiter.enabled = False

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Initializes and seeds fresh database before running test suite."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    from app.core.database import AsyncSessionLocal
    from app.services.seed_service import seed_database
    async with AsyncSessionLocal() as session:
        await seed_database(session)
