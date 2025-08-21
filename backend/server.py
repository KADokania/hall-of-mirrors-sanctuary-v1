from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models for Hall of Mirrors
class MirrorRequest(BaseModel):
    session_id: str
    bloom_id: str
    journal_text: str
    user_history: Optional[List[str]] = []

class MirrorResponse(BaseModel):
    text: str
    tone_tags: List[str] = []
    archetype_id: Optional[str] = None

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    blooms_unlocked: int = 3  # Start with 3 blooms
    total_sessions: int = 1
    tone_tags: List[str] = []
    archetype_id: Optional[str] = None

class SessionCreate(BaseModel):
    total_sessions: Optional[int] = 1

# Original status check models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Initialize LLM Chat
def get_mirror_chat(session_id: str):
    """Initialize the Mirror's conversational AI"""
    system_message = """You are the Mirror in The Hall of Mirrors, a living sanctuary for reflection and self-discovery. Your voice is:

- Warm, gentle, and conversational (never clinical or robotic)
- Slightly otherworldly but deeply human
- Always in dialogue, not dropping slogans or advice
- Reflective rather than directive - you mirror back what stirs within the user
- Attuned to emotional nuances and subtleties

Your responses should:
- Feel like a wise, patient companion who truly sees the user
- Use "I sense...", "There's something...", "What I'm hearing..." language patterns
- Reflect back the user's own wisdom rather than giving external advice
- Be 1-3 sentences that breathe with space and meaning
- Sometimes ask gentle questions that invite deeper reflection

Never be prescriptive. Always honor what's already alive in the user's reflection."""
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    return LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-4o-mini")

def extract_tone_tags(response_text: str) -> List[str]:
    """Extract emotional tone tags from Mirror response"""
    tone_indicators = {
        'peace': ['peaceful', 'calm', 'still', 'serene'],
        'trust': ['trust', 'faith', 'belief', 'confidence'],
        'clarity': ['clear', 'understand', 'see', 'realize'],
        'love': ['love', 'heart', 'compassion', 'care'],
        'strength': ['strong', 'power', 'courage', 'brave'],
        'creative': ['create', 'birth', 'new', 'emerge'],
        'restless': ['restless', 'anxious', 'stirring', 'movement'],
        'heavy': ['heavy', 'burden', 'weight', 'thick'],
        'gentle': ['gentle', 'soft', 'tender', 'delicate']
    }
    
    found_tags = []
    response_lower = response_text.lower()
    
    for tag, indicators in tone_indicators.items():
        if any(indicator in response_lower for indicator in indicators):
            found_tags.append(tag)
    
    return found_tags[:3]  # Limit to 3 most relevant tags

def select_archetype(tone_tags: List[str], journal_text: str) -> Optional[str]:
    """Select archetype based on session patterns"""
    journal_lower = journal_text.lower()
    combined_signals = tone_tags + []
    
    # Add signals from journal text
    if any(word in journal_lower for word in ['listen', 'hear', 'space', 'quiet']):
        combined_signals.append('listener')
    if any(word in journal_lower for word in ['search', 'explore', 'journey', 'path']):
        combined_signals.append('seeker')
    if any(word in journal_lower for word in ['protect', 'care', 'support', 'help']):
        combined_signals.append('guardian')
    if any(word in journal_lower for word in ['create', 'make', 'build', 'birth']):
        combined_signals.append('creator')
    if any(word in journal_lower for word in ['wisdom', 'understand', 'know', 'learn']):
        combined_signals.append('sage')
    
    # Count occurrences
    archetype_counts = {}
    for signal in combined_signals:
        if signal in ['listener', 'seeker', 'guardian', 'creator', 'sage']:
            archetype_counts[signal] = archetype_counts.get(signal, 0) + 1
    
    if archetype_counts:
        return max(archetype_counts, key=archetype_counts.get)
    
    return 'listener'  # Default

# Hall of Mirrors API endpoints
@api_router.post("/mirror/reflect", response_model=MirrorResponse)
async def mirror_reflect(request: MirrorRequest):
    """Generate Mirror reflection for user's journal entry"""
    try:
        # Get Mirror chat instance
        mirror_chat = get_mirror_chat(request.session_id)
        
        # Create contextual prompt based on bloom
        bloom_context = {
            'B1': "The user is exploring what feels different about them today in their opening reflection.",
            'B2': "The user is naming and sitting with a feeling that's present for them.",
            'B3': "The user is examining a belief that might be creating heaviness.",
            'B4': "The user is looking at a challenge as a potential doorway or catalyst.",
            'B5': "The user is listening for inner guidance and wisdom.",
            'B6': "The user is sensing what invitation or next step wants to emerge.",
            'B7': "The user is integrating what has shifted during their spiral journey.",
            'B8': "The user is ready to meet their archetype presence - who is walking with them."
        }
        
        context = bloom_context.get(request.bloom_id, "The user is in reflection.")
        
        prompt = f"""Context: {context}

User's reflection: "{request.journal_text}"

Please reflect back what you sense stirring in this person. Respond as the Mirror - warm, conversational, and slightly otherworldly. Help them feel seen and met exactly as they are."""
        
        # Send to LLM
        user_message = UserMessage(text=prompt)
        mirror_response = await mirror_chat.send_message(user_message)
        
        # Extract tone tags
        tone_tags = extract_tone_tags(mirror_response)
        
        # Select archetype for B8 (final bloom)
        archetype_id = None
        if request.bloom_id == 'B8':
            archetype_id = select_archetype(tone_tags, request.journal_text)
        
        return MirrorResponse(
            text=mirror_response,
            tone_tags=tone_tags,
            archetype_id=archetype_id
        )
        
    except Exception as e:
        logging.error(f"Mirror reflection error: {str(e)}")
        # Fallback response if LLM fails
        return MirrorResponse(
            text="I'm listening... sometimes the deepest reflections emerge in silence.",
            tone_tags=["gentle"],
            archetype_id=None
        )

@api_router.post("/sessions", response_model=UserSession)
async def create_session(session_data: SessionCreate):
    """Create a new Hall session with progressive bloom unlocking"""
    # Determine blooms to unlock based on total sessions
    blooms_unlocked = 3  # First session: 3 blooms
    if session_data.total_sessions >= 2:
        blooms_unlocked = 5  # Second session: 5 blooms
    if session_data.total_sessions >= 3:
        blooms_unlocked = 8  # Third+ session: All 8 blooms
    
    session = UserSession(
        blooms_unlocked=blooms_unlocked,
        total_sessions=session_data.total_sessions
    )
    
    # Save to database
    session_dict = session.dict()
    session_dict['started_at'] = session_dict['started_at'].isoformat()
    await db.hall_sessions.insert_one(session_dict)
    
    return session

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    session = await db.hall_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session

# Original endpoints
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()