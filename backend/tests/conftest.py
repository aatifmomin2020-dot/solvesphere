import pytest
import pytest_asyncio
from app.core.database import init_db

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Initializes and seeds database before running test suite."""
    await init_db()
