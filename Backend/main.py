from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, HttpUrl, Field , EmailStr
from datetime import date, datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from database import get_database_connection

# FUNCTIONS FOR USER AUTHENTICATION:

pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

SECRET_KEY = "campuspulse-secret-key-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)

def create_access_token(username: str):

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": username,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/user/login"
)

def get_current_user(token: str = Depends(oauth2_scheme)):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )

        return username

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
    
#CLASSES FOR ANNOUNCEMENTS AND USERS:
class Announcement(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    deadline: date | None = None
    event_date: date | None = None
    department: str | None = Field(None, max_length=100)
    topic: str | None = Field(None, max_length=255)
    source: str | None = Field(None, max_length=255)
    important_link: HttpUrl | None = None
    requirements: str | None = None
    notes: str | None = None

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    year: int | None = None
    college: str | None = None
    stream: str | None = None
    preferences: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    year: int | None = None
    college: str | None = None
    stream: str | None = None
    preferences: str | None = None

app = FastAPI(
    title="CampusPulse API",
    description="Backend API for the CampusPulse college announcement and opportunity management platform.",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "CampusPulse API is working!"}

# ANNOUNCEMENTS

@app.get(
    "/announcements",
    summary="Get announcements",
    description="Retrieve announcements with optional search, category, event-date, and deadline filters.",
    responses={
        200: {"description": "Announcements retrieved successfully"},
        422: {"description": "Invalid query parameter"}
    }
)
def get_announcements(
    search: str | None = None,
    category: str | None = None,
    event_date: date | None = None,
    deadline: date | None = None
):

    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    query = "SELECT * FROM announcement WHERE 1=1"
    values = []

    # Search
    if search:
        query += """
            AND (
                title LIKE %s
                OR topic LIKE %s
                OR department LIKE %s
            )
        """

        search_value = "%" + search + "%"

        values.append(search_value)
        values.append(search_value)
        values.append(search_value)

    # Category filter
    if category:
        query += " AND category = %s"
        values.append(category)

    # Event date filter
    if event_date:
        query += " AND event_date = %s"
        values.append(event_date)

    # Deadline filter
    if deadline:
        query += " AND deadline = %s"
        values.append(deadline)

    query += " ORDER BY A_ID DESC"

    cursor.execute(query, tuple(values))

    announcements = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "count": len(announcements),
        "announcements": announcements
    }

@app.get(
    "/announcements/{announcement_id}",
    summary="Get an announcement",
    description="Retrieve a single announcement using its announcement ID.",
    responses={
        200: {"description": "Announcement retrieved successfully"},
        404: {"description": "Announcement not found"},
        422: {"description": "Invalid announcement ID"}
    }
)
def get_announcement(announcement_id: int):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = "SELECT * FROM announcement WHERE A_ID = %s"
    values = (announcement_id,)

    cursor.execute(query, values)

    announcement = cursor.fetchone()

    cursor.close()
    connection.close()

    if announcement is None:
        raise HTTPException(status_code=404,detail="Announcement not found")

    return announcement

@app.post(
    "/announcements",
    summary="Create an announcement",
    description="Create and store a new announcement in the CampusPulse database.",
    responses={
        200: {"description": "Announcement created successfully"},
        422: {"description": "Invalid announcement data"}
    }
)
def create_announcement(announcement: Announcement):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO announcement
        (title, category, deadline, event_date, department, topic,
         source, important_link, requirements, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        announcement.title,
        announcement.category,
        announcement.deadline,
        announcement.event_date,
        announcement.department,
        announcement.topic,
        announcement.source,
        str(announcement.important_link) if announcement.important_link else None,
        announcement.requirements,
        announcement.notes
    )

    cursor.execute(query, values)

    connection.commit()

    announcement_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Announcement created successfully",
        "A_ID": announcement_id
    }

@app.put(
    "/announcements/{announcement_id}",
    summary="Update an announcement",
    description="Update an existing announcement using its announcement ID.",
    responses={
        200: {"description": "Announcement updated successfully"},
        404: {"description": "Announcement not found"},
        422: {"description": "Invalid announcement data or ID"}
    }
)
def update_announcement(announcement_id: int,announcement: Announcement):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = """
        UPDATE announcement
        SET title = %s,
            category = %s,
            deadline = %s,
            event_date = %s,
            department = %s,
            topic = %s,
            source = %s,
            important_link = %s,
            requirements = %s,
            notes = %s
        WHERE A_ID = %s
    """

    values = (
        announcement.title,
        announcement.category,
        announcement.deadline,
        announcement.event_date,
        announcement.department,
        announcement.topic,
        announcement.source,
        str(announcement.important_link) if announcement.important_link else None,
        announcement.requirements,
        announcement.notes,
        announcement_id
    )

    cursor.execute(query, values)

    connection.commit()

    rows_updated = cursor.rowcount

    cursor.close()
    connection.close()

    if rows_updated == 0:
        raise HTTPException(status_code=404,detail="Announcement not found")

    return {"message": "Announcement updated successfully","A_ID": announcement_id}

@app.delete(
    "/announcements/{announcement_id}",
    summary="Delete an announcement",
    description="Delete an existing announcement using its announcement ID.",
    responses={
        200: {"description": "Announcement deleted successfully"},
        404: {"description": "Announcement not found"},
        422: {"description": "Invalid announcement ID"}
    }
)
def delete_announcement(announcement_id: int):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = "DELETE FROM announcement WHERE A_ID = %s"
    values = (announcement_id,)

    cursor.execute(query, values)

    connection.commit()

    rows_deleted = cursor.rowcount

    cursor.close()
    connection.close()

    if rows_deleted == 0:
        raise HTTPException(status_code=404,detail="Announcement not found")

    return {"message": "Announcement deleted successfully","A_ID": announcement_id}


#USER:
@app.post(
    "/user/register",
    summary="Register a new user",
    description="Create a new CampusPulse user account with a securely hashed password.",
    responses={
        200: {"description": "User registered successfully"},
        400: {"description": "Username or email already exists"},
        422: {"description": "Invalid registration data"}
    }
)
def register_user(user: UserRegister):

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT P_ID FROM personal_info WHERE username = %s",(user.username,))

    if cursor.fetchone():
        cursor.close()
        connection.close()

        raise HTTPException(status_code=400,detail="Username already exists")

    cursor.execute("SELECT P_ID FROM personal_info WHERE email = %s",(user.email,))

    if cursor.fetchone():
        cursor.close()
        connection.close()

        raise HTTPException(status_code=400,detail="Email already exists")

    hashed_password = hash_password(user.password)

    query = """
        INSERT INTO personal_info
        (name, email, username, password, year, college, stream, preferences)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        user.name,
        user.email,
        user.username,
        hashed_password,
        user.year,
        user.college,
        user.stream,
        user.preferences
    )

    cursor.execute(query, values)
    connection.commit()

    user_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "User registered successfully",
        "P_ID": user_id
    }

@app.post(
    "/user/login",
    summary="User login",
    description="Authenticate a user and return a JWT access token.",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid username or password"},
        422: {"description": "Invalid login request"}
    }
)
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):

    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT P_ID, username, password
        FROM personal_info
        WHERE username = %s
    """

    cursor.execute(query, (form_data.username,))

    db_user = cursor.fetchone()

    cursor.close()
    connection.close()

    if db_user is None:
        raise HTTPException(status_code=401,detail="Invalid username or password")

    if not verify_password(form_data.password,db_user["password"]):
        raise HTTPException(status_code=401,detail="Invalid username or password")

    access_token = create_access_token(
        db_user["username"]
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get(
    "/user/{pid}",
    summary="Get user profile",
    description="Retrieve a user's profile using their P_ID.",
    responses={
        200: {"description": "User profile retrieved successfully"},
        401: {"description": "Authentication failed"},
        404: {"description": "User not found"},
        422: {"description": "Invalid user ID"}
    }
)
def get_user(pid: int,current_user: str = Depends(get_current_user)):

    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT P_ID, name, email, username, year,
               college, stream, preferences
        FROM personal_info
        WHERE P_ID = %s
    """

    cursor.execute(query, (pid,))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user is None:
        raise HTTPException(status_code=404,detail="User not found")

    return user

@app.put(
    "/user/{pid}",
    summary="Update user profile",
    description="Update an existing user's profile information.",
    responses={
        200: {"description": "User updated successfully"},
        404: {"description": "User not found"},
        422: {"description": "Invalid user data"}
    }
)
def update_user(pid: int, user: UserUpdate):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = """
        UPDATE personal_info
        SET name = %s,
            email = %s,
            year = %s,
            college = %s,
            stream = %s,
            preferences = %s
        WHERE P_ID = %s
    """

    values = (
        user.name,
        user.email,
        user.year,
        user.college,
        user.stream,
        user.preferences,
        pid
    )

    cursor.execute(query, values)
    connection.commit()

    rows_updated = cursor.rowcount

    cursor.close()
    connection.close()

    if rows_updated == 0:
        raise HTTPException(status_code=404,detail="User not found")

    return {
        "message": "User updated successfully",
        "P_ID": pid
    }

@app.delete(
    "/user/{pid}",
    summary="Delete user",
    description="Delete a user account using their P_ID.",
    responses={
        200: {"description": "User deleted successfully"},
        404: {"description": "User not found"},
        422: {"description": "Invalid user ID"}
    }
)
def delete_user(pid: int):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = "DELETE FROM personal_info WHERE P_ID = %s"

    cursor.execute(query, (pid,))
    connection.commit()

    rows_deleted = cursor.rowcount

    cursor.close()
    connection.close()

    if rows_deleted == 0:
        raise HTTPException(status_code=404,detail="User not found")

    return {
        "message": "User deleted successfully",
        "P_ID": pid
    }


#BOOKMARKS:
@app.get(
    "/bookmarks",
    summary="Get bookmarked announcements",
    description="Retrieve all announcements bookmarked by a specific user.",
    responses={
        200: {"description": "Bookmarks retrieved successfully"},
        422: {"description": "Invalid user ID"}
    }
)
def get_bookmarks(P_ID: int):

    connection = get_database_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT
            a.A_ID,
            a.title,
            a.category,
            a.deadline,
            a.event_date,
            a.department,
            a.topic,
            a.source,
            a.important_link,
            a.requirements,
            a.notes,
            b.Saved_At
        FROM bookmark b
        JOIN announcement a
            ON b.A_ID = a.A_ID
        WHERE b.P_ID = %s
        ORDER BY b.Saved_At DESC
    """

    cursor.execute(query, (P_ID,))
    bookmarks = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "P_ID": P_ID,
        "bookmarks": bookmarks
    }

@app.post(
    "/announcements/{A_ID}/bookmark",
    summary="Bookmark an announcement",
    description="Save an announcement to a user's bookmarks.",
    responses={
        200: {"description": "Announcement bookmarked successfully"},
        400: {"description": "Announcement is already bookmarked"},
        404: {"description": "User or announcement not found"},
        422: {"description": "Invalid ID"}
    }
)
def bookmark_announcement(A_ID: int, P_ID: int):

    connection = get_database_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT P_ID FROM personal_info WHERE P_ID = %s",(P_ID,))
    if cursor.fetchone() is None:
        cursor.close()
        connection.close()

        raise HTTPException(status_code=404,detail="User not found" )

    cursor.execute("SELECT A_ID FROM announcement WHERE A_ID = %s",(A_ID,))

    if cursor.fetchone() is None:
        cursor.close()
        connection.close()

        raise HTTPException(status_code=404,detail="Announcement not found")

    cursor.execute("""SELECT P_ID, A_ID FROM bookmark WHERE P_ID = %s AND A_ID = %s""",(P_ID, A_ID))

    if cursor.fetchone():
        cursor.close()
        connection.close()

        raise HTTPException(status_code=400,detail="Announcement already bookmarked")
    cursor.execute("""INSERT INTO bookmark (P_ID, A_ID) VALUES (%s, %s)""",(P_ID, A_ID))
    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Announcement bookmarked successfully","P_ID": P_ID,"A_ID": A_ID}

@app.delete(
    "/announcements/{A_ID}/bookmark",
    summary="Remove a bookmark",
    description="Remove an announcement from a user's bookmarks.",
    responses={
        200: {"description": "Bookmark removed successfully"},
        404: {"description": "Bookmark not found"},
        422: {"description": "Invalid ID"}
    }
)
def remove_bookmark(A_ID: int, P_ID: int):

    connection = get_database_connection()
    cursor = connection.cursor()

    query = """
        DELETE FROM bookmark
        WHERE P_ID = %s AND A_ID = %s
    """

    cursor.execute(query, (P_ID, A_ID))
    connection.commit()

    deleted = cursor.rowcount

    cursor.close()
    connection.close()

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Bookmark not found"
        )

    return {
        "message": "Bookmark removed successfully",
        "P_ID": P_ID,
        "A_ID": A_ID
    }

"""
#AI:
@app.post("/announcements/analyze")
def analyze_announcement(announcement: Announcement):
    return {
        "message": "Announcement analyzed successfully",
        "announcement": announcement
    }
"""
