import api from "./axios";

export const login = async (email: string, password: string, recaptcha_token: string) => {
  try {
    const response = await api.post("/login", {
      email,
      password,
      recaptcha_token,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    // Attempt to notify backend
    await api.post("/logout", {}, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Logout API call failed", error);
  }
};

// --- NEW: Check Token Validity ---
export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    // Expecting 200 OK if valid, 401 Unauthorized if deleted
    const response = await api.get("/user-check", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error; // Will trigger the logout in the handler
  }
};

export default {
  login,
  logout,
  checkAuth,
};