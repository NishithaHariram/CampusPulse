// Central API configuration for CampusPulse
// Change this base URL when the backend moves to a different host.

export const API_BASE_URL ="http://127.0.0.1:8000";

const TOKEN_KEY = "campuspulse_token";
const USER_PID_KEY = "campuspulse_pid";
const USERNAME_KEY = "campuspulse_username";

// -----------------------------------------------------------------------
// AUTH STORAGE
// -----------------------------------------------------------------------

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getUserPid() {
  const pid = localStorage.getItem(USER_PID_KEY);
  return pid ? Number(pid) : null;
}

export function setUserPid(pid) {
  if (pid !== null && pid !== undefined) {
    localStorage.setItem(USER_PID_KEY, String(pid));
  } else {
    localStorage.removeItem(USER_PID_KEY);
  }
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

export function setUsername(username) {
  if (username) {
    localStorage.setItem(USERNAME_KEY, username);
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_PID_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

// -----------------------------------------------------------------------
// LOW-LEVEL REQUEST HELPERS
// -----------------------------------------------------------------------

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  const isJson = contentType.includes("application/json");

  const data = isJson
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      (typeof data === "string" ? data : null) ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

function authHeaders() {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// -----------------------------------------------------------------------
// GET REQUEST
// -----------------------------------------------------------------------

async function getJSON(
  path,
  { params, withAuth = true } = {}
) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers = {
    Accept: "application/json",
  };

  if (withAuth) {
    Object.assign(headers, authHeaders());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  return parseResponse(response);
}

// -----------------------------------------------------------------------
// POST JSON REQUEST
// -----------------------------------------------------------------------

async function postJSON(
  path,
  body,
  { withAuth = true } = {}
) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (withAuth) {
    Object.assign(headers, authHeaders());
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  return parseResponse(response);
}

// -----------------------------------------------------------------------
// PUT JSON REQUEST
// -----------------------------------------------------------------------

async function putJSON(
  path,
  body,
  { withAuth = true } = {}
) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (withAuth) {
    Object.assign(headers, authHeaders());
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    }
  );

  return parseResponse(response);
}

// -----------------------------------------------------------------------
// DELETE REQUEST
// -----------------------------------------------------------------------

async function deleteJSON(
  path,
  { withAuth = true } = {}
) {
  const headers = {
    Accept: "application/json",
  };

  if (withAuth) {
    Object.assign(headers, authHeaders());
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "DELETE",
      headers,
    }
  );

  return parseResponse(response);
}

// -----------------------------------------------------------------------
// OAUTH2 FORM-ENCODED LOGIN
// -----------------------------------------------------------------------

async function postForm(path, formData) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  return parseResponse(response);
}

// -----------------------------------------------------------------------
// AUTH API
// -----------------------------------------------------------------------

export async function registerUser(payload) {
  return postJSON(
    "/user/register",
    payload,
    {
      withAuth: false,
    }
  );
}

export async function loginUser(username, password) {
  const body = new URLSearchParams();

  body.append("username", username);
  body.append("password", password);

  const data = await postForm(
    "/user/login",
    body
  );

  // Store JWT token
  if (data?.access_token) {
    setToken(data.access_token);
    setUsername(username);
  }

  // Store P_ID returned by the backend
  if (
    data?.P_ID !== undefined &&
    data?.P_ID !== null
  ) {
    setUserPid(data.P_ID);
  }

  return data;
}

export async function getUserProfile(pid) {
  return getJSON(
    `/user/${pid}`,
    {
      withAuth: true,
    }
  );
}

export async function updateUserProfile(
  pid,
  payload
) {
  return putJSON(
    `/user/${pid}`,
    payload,
    {
      withAuth: true,
    }
  );
}

export async function deleteUser(pid) {
  return deleteJSON(
    `/user/${pid}`,
    {
      withAuth: true,
    }
  );
}

// -----------------------------------------------------------------------
// ANNOUNCEMENTS API
// -----------------------------------------------------------------------

export async function getAnnouncements(
  filters = {}
) {
  return getJSON(
    "/announcements",
    {
      params: filters,
      withAuth: false,
    }
  );
}

export async function getAnnouncement(id) {
  return getJSON(
    `/announcements/${id}`,
    {
      withAuth: false,
    }
  );
}

export async function createAnnouncement(
  payload
) {
  return postJSON(
    "/announcements",
    payload,
    {
      withAuth: true,
    }
  );
}

export async function updateAnnouncement(
  id,
  payload
) {
  return putJSON(
    `/announcements/${id}`,
    payload,
    {
      withAuth: true,
    }
  );
}

export async function deleteAnnouncement(id) {
  return deleteJSON(
    `/announcements/${id}`,
    {
      withAuth: true,
    }
  );
}

// -----------------------------------------------------------------------
// BOOKMARKS API
// -----------------------------------------------------------------------

export async function getBookmarks(pid) {
  if (!pid) {
    throw new Error(
      "User ID is missing. Please log in again."
    );
  }

  return getJSON(
    "/bookmarks",
    {
      params: {
        P_ID: pid,
      },
      withAuth: true,
    }
  );
}

export async function addBookmark(
  announcementId,
  pid
) {
  if (!pid) {
    throw new Error(
      "User ID is missing. Please log in again."
    );
  }

  return postJSON(
    `/announcements/${announcementId}/bookmark?P_ID=${pid}`,
    {},
    {
      withAuth: true,
    }
  );
}

export async function removeBookmark(
  announcementId,
  pid
) {
  if (!pid) {
    throw new Error(
      "User ID is missing. Please log in again."
    );
  }

  return deleteJSON(
    `/announcements/${announcementId}/bookmark?P_ID=${pid}`,
    {
      withAuth: true,
    }
  );
}

// -----------------------------------------------------------------------
// AI ANALYZER API
// -----------------------------------------------------------------------

export async function analyzeAnnouncement(
  text
) {
  return postJSON(
    "/announcements/analyze",
    {
      text,
    },
    {
      withAuth: true,
    }
  );
}

// -----------------------------------------------------------------------
// USER-FRIENDLY ERROR MESSAGES
// -----------------------------------------------------------------------

export function friendlyErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  const msg =
    typeof error === "string"
      ? error
      : error.message || "";

  const lower = msg.toLowerCase();

  if (
    error.status === 0 ||
    lower.includes("failed to fetch")
  ) {
    return "Unable to connect to CampusPulse server. Make sure the backend is running.";
  }

  if (error.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.status === 403) {
    return "You do not have permission to do this.";
  }

  if (error.status === 404) {
    return "The requested item was not found.";
  }

  if (
    lower.includes("username already exists") ||
    lower.includes("username taken")
  ) {
    return "That username is already taken. Please choose another.";
  }

  if (
    lower.includes("email already exists") ||
    lower.includes("email registered")
  ) {
    return "An account with that email already exists.";
  }

  if (
    lower.includes("invalid") &&
    lower.includes("credential")
  ) {
    return "Invalid username or password.";
  }

  if (
    lower.includes("bookmark already exists")
  ) {
    return "This announcement is already bookmarked.";
  }

  if (
    lower.includes("bookmark not found")
  ) {
    return "This bookmark could not be found.";
  }

  return (
    msg ||
    "Something went wrong. Please try again."
  );
}