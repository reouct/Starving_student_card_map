export function getToken() {
  return localStorage.getItem("ssc_token") || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("ssc_token", token);
  } else {
    localStorage.removeItem("ssc_token");
  }
}

// NEW: Helper functions for User ID
export function getUserId() {
  return localStorage.getItem("ssc_user_id") || null;
}

export function setUserId(id) {
  if (id) {
    localStorage.setItem("ssc_user_id", id);
  } else {
    localStorage.removeItem("ssc_user_id");
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload || null;
  } catch (e) {
    return null;
  }
}

export function isAdmin() {
  const user = getUserFromToken();
  return user?.role === "admin";
}

export async function logout() {
  const token = getToken();
  try {
    await fetch("http://localhost:3000/api/auth", {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
  } catch (e) {
    // ignore network errors on logout
  }
  setToken(null);
  setUserId(null); // Clear user ID on logout
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}