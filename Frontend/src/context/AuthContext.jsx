import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getToken,
  setToken,
  getUserPid,
  setUserPid,
  getUsername,
  setUsername,
  clearAuthStorage,
  loginUser as apiLoginUser,
  getUserProfile,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [pid, setPidState] = useState(null);
  const [username, setUsernameState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, rehydrate from localStorage
  useEffect(() => {
    const storedToken = getToken();
    const storedPid = getUserPid();
    const storedUsername = getUsername();
    if (storedToken) setTokenState(storedToken);
    if (storedPid) setPidState(storedPid);
    if (storedUsername) setUsernameState(storedUsername);
    setLoading(false);
  }, []);

  // Fetch the full profile once we have a pid and token
  const loadProfile = useCallback(async () => {
    if (!pid || !token) return null;
    try {
      const data = await getUserProfile(pid);
      setProfile(data);
      return data;
    } catch (err) {
      return null;
    }
  }, [pid, token]);

  useEffect(() => {
    if (pid && token && !profile) {
      loadProfile();
    }
  }, [pid, token, profile, loadProfile]);

  const login = useCallback(async (user, password) => {
  const data = await apiLoginUser(user, password);

  setTokenState(data.access_token);
  setUsernameState(user);

  if (data?.P_ID !== undefined && data?.P_ID !== null) {
    setPidState(Number(data.P_ID));
    setUserPid(data.P_ID);
  }

  return data;
}, []);

  const setPid = useCallback((newPid) => {
    setPidState(newPid);
    setUserPid(newPid);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setTokenState(null);
    setPidState(null);
    setUsernameState(null);
    setProfile(null);
  }, []);

  const value = {
    token,
    pid,
    username,
    profile,
    setPid,
    setProfile,
    loadProfile,
    login,
    logout,
    isAuthenticated: Boolean(token),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
