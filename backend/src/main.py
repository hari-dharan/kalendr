from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from src import models, schemas, database
from src.database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
import uuid

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kalendr API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Kalendr API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "kalendr-backend"}

@app.get("/events", response_model=list[schemas.Event])
def list_events(db: Session = Depends(get_db)):
    return db.query(models.Event).order_by(models.Event.start_time).all()

@app.post("/events", response_model=schemas.Event)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = models.Event(
        title=event.title,
        description=event.description,
        location=event.location,
        start_time=event.start,
        end_time=event.end,
        all_day=event.all_day,
        color=event.color
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.put("/events/{event_id}", response_model=schemas.Event)
def update_event(event_id: str, event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == uuid.UUID(event_id)).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_event.title = event.title
    db_event.description = event.description
    db_event.location = event.location
    db_event.start_time = event.start
    db_event.end_time = event.end
    db_event.all_day = event.all_day
    db_event.color = event.color
    
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/events/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == uuid.UUID(event_id)).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted successfully"}