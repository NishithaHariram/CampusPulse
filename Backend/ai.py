from google import genai
from pydantic import BaseModel, HttpUrl
from datetime import date
from dotenv import load_dotenv
import os
load_dotenv()

class AIAnnouncement(BaseModel):
    title: str
    category: str
    deadline: date | None = None
    event_date: date | None = None
    department: str | None = None
    topic: str | None = None
    source: str | None = None
    important_link: HttpUrl | None = None
    requirements: str | None = None
    notes: str | None = None
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_announcement(raw_text: str):
    prompt = f"""
Extract structured information from this college announcement.

Extract:
- title
- category
- deadline
- event_date
- department
- topic
- source
- important_link
- requirements
- notes

Rules:
- Do not invent information.
- Use null when information is missing.
- Dates must be YYYY-MM-DD.
- Return only structured information.

Announcement:
{raw_text}
"""
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={"response_mime_type": "application/json","response_schema": AIAnnouncement,})
    return AIAnnouncement.model_validate_json(response.text)