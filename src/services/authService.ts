import api from "./axios";

export const login = async (email: string, password: string, recaptcha_token: string) => {
  try {
    const response = await api.post("/login", {
      email,
      password,
      recaptcha_token, // Send token to backend
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    // Endpoint: POST /logout
    await api.post("/logout", {}, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Logout API call failed", error);
    // Even if API fails, we usually proceed to clear client session
    throw error;
  }
};

export default {
  login,
  logout,
};