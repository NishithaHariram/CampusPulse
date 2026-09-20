from google import genai
from pydantic import BaseModel, HttpUrl
from datetime import date
from dotenv import load_dotenv
import os
import time

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

    # Primary model + fallback model
    models = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite"
    ]

    last_error = None

    for model in models:

        # Retry temporary failures up to 3 times
        for attempt in range(3):

            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": AIAnnouncement,
                    }
                )

                return AIAnnouncement.model_validate_json(response.text)

            except Exception as e:
                last_error = e

                error_text = str(e)

                # Retry only temporary/unavailable errors
                if "503" in error_text or "UNAVAILABLE" in error_text:

                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                    continue

                # Other errors should not be hidden
                raise e

        # If primary model failed 3 times,
        # automatically try the fallback model.

    raise Exception(
        f"AI extraction failed after retries and fallback model: {last_error}"
    )