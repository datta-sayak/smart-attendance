
import pytest
import os
import sys
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

# 1. Mock Environment Variables BEFORE importing app
os.environ["MONGO_URI"] = "mongodb://localhost:27017"
os.environ["MONGO_DB"] = "test_db"
os.environ["JWT_SECRET"] = "test_secret"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["BREVO_API_KEY"] = "test_key"
os.environ["BREVO_SENDER_EMAIL"] = "test@example.com"
os.environ["BREVO_SENDER_NAME"] = "Test Sender"

# 2. Patch Motor Client to prevent connection attempts during import
# We must do this before importing app.db.mongo
mock_motor = MagicMock()
sys.modules["motor"] = mock_motor
sys.modules["motor.motor_asyncio"] = mock_motor.motor_asyncio

# Now we can import the app and the db object (which is now a Mock)
from app.main import app
from app.db.mongo import db as global_mock_db

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def mock_db():
    """
    Configure the global mock database for every test.
    """
    # Reset the mock to clear calls from previous tests
    global_mock_db.reset_mock()
    
    # Configure existing children without replacing them
    global_mock_db.users.reset_mock()
    global_mock_db.students.reset_mock()
    global_mock_db.subjects.reset_mock()
    global_mock_db.attendance.reset_mock()
    
    # Link __getitem__ to returning the same attributes
    # This ensures db["users"] returns db.users
    def getitem(name):
        return getattr(global_mock_db, name)
    global_mock_db.__getitem__.side_effect = getitem
    
    # Async methods need AsyncMock return values
    global_mock_db.users.find_one = AsyncMock(return_value=None)
    global_mock_db.users.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
    global_mock_db.users.update_one = AsyncMock(return_value=MagicMock(modified_count=1))
    
    global_mock_db.students.find_one = AsyncMock(return_value=None)
    global_mock_db.students.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
    global_mock_db.students.update_one = AsyncMock(return_value=MagicMock(modified_count=1))
    
    global_mock_db.subjects.find_one = AsyncMock(return_value=None)
    # mock.find() returns a cursor which needs to be iterable or have to_list
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[])
    # Make the cursor iterable for 'async for'
    mock_cursor.__aiter__.return_value = iter([])
    global_mock_db.subjects.find.return_value = mock_cursor
    
    global_mock_db.subjects.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
    global_mock_db.subjects.update_one = AsyncMock(return_value=MagicMock(modified_count=1))

    global_mock_db.attendance.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
    global_mock_db.attendance.find_one = AsyncMock(return_value={"_id": "test_id"})
    global_mock_db.attendance.find.return_value = mock_cursor
    
    yield global_mock_db

@pytest.fixture
def mock_ml_service():
    """
    Mock the ML service client
    """
    with patch("app.services.ml_client.ml_client") as mock:
         mock.encode_face = AsyncMock(return_value={"success": True, "embedding": [0.1]*128})
         mock.match_face = AsyncMock(return_value={"match": True})
         yield mock

@pytest.fixture
def test_user():
    return {
        "id": "507f1f77bcf86cd799439011",
        "email": "student@example.com",
        "role": "student"
    }

@pytest.fixture
def auth_headers(test_user):
    from jose import jwt
    payload = {
        "sub": test_user["id"],
        "role": test_user["role"],
        "email": test_user["email"]
    }
    token = jwt.encode(payload, "test_secret", algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}
