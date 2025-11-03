# Kalendr - AI Coding Agent Instructions

## Architecture Overview
Kalendr is a full-stack calendar application with React/TypeScript frontend and FastAPI/SQLAlchemy backend, orchestrated via Docker Compose.

**Service Architecture:**
- **Frontend**: React 19 + TypeScript + Vite (port 3000) - uses FullCalendar.js for calendar UI
- **Backend**: FastAPI + SQLAlchemy 2.0 + PostgreSQL (port 8000) - RESTful API for calendar events
- **Database**: PostgreSQL 15 (port 5432) - single `events` table with UUID primary keys

## Development Workflow

### Starting the Application
```bash
docker-compose up -d  # Start all services
```

**Critical**: Services have dependency chain with health checks: `frontend -> backend -> db (healthy)`. Backend waits for database health check before starting. Always use docker-compose for development.

### Backend Development
- **Entry point**: `backend/src/main.py` - FastAPI app with CORS enabled for frontend
- **Database models**: Use SQLAlchemy 2.0 `Mapped` annotations (see `models.py`)
- **Schema validation**: Pydantic models in `schemas.py` with `from_attributes = True`
- **Database URL**: Set via environment variable in docker-compose.yml

**Event API Pattern:**
```python
# All endpoints follow this UUID-based pattern
@app.get("/events/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    return db.query(models.Event).filter(models.Event.id == uuid.UUID(event_id)).first()
```

### Frontend Development
- **Build tool**: Vite with HMR - use `npm run dev` for development server
- **API client**: Axios instance in `services/api.ts` points to `http://localhost:8000`
- **Calendar library**: FullCalendar React component for event rendering
- **State management**: Currently using React useState (no external state library)

## Project Conventions

### Database Patterns
- **Primary keys**: Always UUID with `uuid.uuid4()` default
- **Timestamps**: Use SQLAlchemy `TIMESTAMP(timezone=False)` for datetime fields
- **Field naming**: Snake_case in database, camelCase in API schemas via Pydantic aliases

### API Patterns
- **Response models**: All endpoints specify Pydantic response models
- **Error handling**: Use `HTTPException(status_code=404, detail="...")` for not found
- **Dependencies**: Database sessions via `Depends(get_db)` dependency injection

### Docker Configuration
- **Build context**: Each service builds from its own directory
- **Port exposure**: Backend 8000, frontend 3000, db 5432
- **Environment**: Database connection configured via environment variables
- **Volumes**: PostgreSQL data persisted in named volume `db_data`

## Key Files to Understand

- `backend/src/main.py` - API endpoints and application setup
- `backend/src/models.py` - SQLAlchemy ORM models with modern annotations
- `docker-compose.yml` - Complete service orchestration and networking
- `frontend/src/services/api.ts` - Axios configuration for backend communication
- `backend/requirements.in` - Human-readable dependencies (compile with pip-tools)

## Integration Points

**Frontend ↔ Backend:**
- Frontend expects backend at `localhost:8000` (hardcoded in api.ts)
- CORS configured to allow all origins for development
- Event data flows via REST API with UUID identifiers

**Backend ↔ Database:**
- SQLAlchemy 2.0 with declarative base and dependency injection
- Automatic table creation via `Base.metadata.create_all(bind=engine)`
- Database URL from environment variable for containerized deployment