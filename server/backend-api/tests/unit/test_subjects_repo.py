
import pytest
from bson import ObjectId
from app.db.subjects_repo import get_subject_by_code, create_subject, add_professor_to_subject
from unittest.mock import MagicMock, AsyncMock

@pytest.mark.asyncio
async def test_get_subject_by_code(mock_db):
    # Arrange
    mock_db.subjects.find_one.return_value = {"code": "CS101", "name": "CS"}
    
    # Act
    result = await get_subject_by_code("CS101")
    
    # Assert
    assert result["code"] == "CS101"
    mock_db.subjects.find_one.assert_called_with({"code": "CS101"})

@pytest.mark.asyncio
async def test_create_subject(mock_db):
    # Arrange
    pid = ObjectId()
    mock_db.subjects.insert_one.return_value = MagicMock(inserted_id=ObjectId())
    
    # Act
    result = await create_subject("Math", "M101", pid)
    
    # Assert
    assert result["name"] == "Math"
    assert result["code"] == "M101"
    assert "created_at" in result
    mock_db.subjects.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_add_professor_to_subject(mock_db):
    # Arrange
    sid = ObjectId()
    pid = ObjectId()
    
    # Act
    await add_professor_to_subject(sid, pid)
    
    # Assert
    mock_db.subjects.update_one.assert_called_with(
        {"_id": sid},
        {"$addToSet": {"professor_ids": pid}}
    )
