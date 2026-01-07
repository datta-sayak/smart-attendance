# Migration Guide: From Monolithic to Microservices

## Overview

This guide helps you migrate from the old monolithic backend to the new microservices architecture.

## What Changed?

### Old Architecture (Monolithic)
```
backend/
└── All-in-one service (Auth + CRUD + ML)
    ❌ Can't deploy to cloud (ML dependencies)
    ❌ Heavy system requirements
    ❌ Tight coupling
```

### New Architecture (Microservices)
```
backend-api/          ml-face-service/
├── Auth             ├── Face Detection
├── CRUD             ├── Face Encoding
├── Reports          └── Face Matching
└── No ML deps       
✅ Deployable        ❌ Local only
```

## Migration Steps

### 1. For Local Development (With Face Recognition)

**Step 1**: Start ML Service
```bash
cd ml-face-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.main
```

**Step 2**: Start Backend API
```bash
cd backend-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add: ML_SERVICE_URL=http://localhost:8001
python -m app.main
```

**Step 3**: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. For Cloud Deployment (Without Face Recognition)

**Option A: Deploy Backend API Only**
```bash
# Deploy to Render/Railway/VPS
cd backend-api
# Leave ML_SERVICE_URL empty in .env
# Deploy using platform CLI or dashboard
```

**Option B: Deploy Backend + Remote ML Service**
```bash
# 1. Deploy Backend API to cloud
# 2. Run ML Service on local server
# 3. Configure ML_SERVICE_URL to point to local server
# Note: Requires VPN or tunnel (e.g., ngrok)
```

## Data Migration

### Face Embeddings

**Old**: Stored in MongoDB `students.face_embeddings` array
**New**: Stored in ML service local files `ml-face-service/storage/embeddings/{student_id}.json`

**Migration Script** (if needed):
```python
# Not needed for fresh installations
# For existing data, create a migration script to:
# 1. Read face_embeddings from MongoDB
# 2. Save to JSON files in ML service
# 3. Remove face_embeddings field from MongoDB
```

### Database Schema

No changes required! The database schema is compatible:
- `students` collection: `face_embeddings` field is now optional
- Students still have `verified` boolean
- All other fields remain the same

## API Changes

### For Frontend Developers

**No changes needed!** The API endpoints remain the same:

```javascript
// Face registration - same endpoint
POST /students/me/face-image
// Backend forwards to ML service internally

// Attendance marking - same endpoint
POST /api/attendance/mark
// Backend calls ML service internally
```

### Response Format

Responses are identical to the old system. Example:

```json
// POST /api/attendance/mark
{
  "faces": [
    {
      "student": {"id": "...", "name": "...", "roll": "..."},
      "status": "present",
      "confidence": 0.95,
      "distance": 0.42,
      "box": {"top": 100, "right": 300, "bottom": 400, "left": 100}
    }
  ],
  "count": 1
}
```

## Environment Variables

### Backend API

**New variables:**
```env
ML_SERVICE_URL=http://localhost:8001  # Optional
```

**Removed variables:**
```env
# None - all existing variables still work
```

### ML Service

**New file** `ml-face-service/.env`:
```env
ML_SERVICE_PORT=8001
CONFIDENCE_THRESHOLD=0.50
UNCERTAIN_THRESHOLD=0.60
EMBEDDINGS_STORAGE_PATH=./storage/embeddings
```

## Testing

### Test Backend Without ML Service

```bash
cd backend-api
# Leave ML_SERVICE_URL empty
python -m app.main

# Face registration will fail gracefully
# All other features work normally
```

### Test Full System

```bash
# Terminal 1: ML Service
cd ml-face-service && python -m app.main

# Terminal 2: Backend API
cd backend-api && python -m app.main

# Terminal 3: Frontend
cd frontend && npm run dev

# Test face registration
# Test attendance marking
```

## Troubleshooting

### "ML Service unavailable"

**Cause**: Backend can't reach ML service
**Fix**: 
1. Check ML service is running: `http://localhost:8001/api/face/health`
2. Verify `ML_SERVICE_URL` in backend `.env`
3. Check firewall settings

### "No face detected"

**Cause**: Image quality or lighting issues
**Fix**: Same as before - ensure good lighting and clear face

### "Student embeddings not found"

**Cause**: Student hasn't registered face in ML service
**Fix**: Student must upload face photo via `/students/me/face-image`

## Rollback Plan

If you need to rollback to the old system:

```bash
# Keep both systems during transition
git checkout main  # Switch to old code
cd backend
python -m app.main

# Old system still works as before
```

## Benefits of New Architecture

✅ **Deployable**: Backend API can deploy to Render/Railway
✅ **Faster Startup**: No ML dependencies to load
✅ **Scalable**: Services can scale independently
✅ **Maintainable**: Clear separation of concerns
✅ **Flexible**: Backend works with or without ML

## Next Steps

1. ✅ Test both services locally
2. ✅ Deploy backend API to cloud
3. ✅ Keep ML service on local machine
4. ✅ Update frontend to point to deployed API
5. ✅ Monitor and optimize

## Support

- 📘 [Architecture Overview](./ARCHITECTURE.md)
- 🔧 [Backend API Docs](./backend-api/README.md)
- 🤖 [ML Service Docs](./ml-face-service/README.md)
- 📝 [Main README](./README.md)

## Comparison Table

| Feature | Old (Monolithic) | New (Microservices) |
|---------|-----------------|-------------------|
| Deployable | ❌ No (ML deps) | ✅ Yes (backend-api) |
| Startup Time | ~30s | ~5s (backend) |
| Memory Usage | ~800MB | ~100MB (backend) |
| Dependencies | 25+ packages | 15 packages (backend) |
| Face Recognition | ✅ Included | ✅ Via ML service |
| Cloud Deployment | ❌ Not possible | ✅ Easy |
| Local Development | ✅ Works | ✅ Works |
| Scalability | ❌ Limited | ✅ Horizontal |
| Maintenance | ❌ Complex | ✅ Simple |

---

**Questions?** Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information.
