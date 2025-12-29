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

export default {
  login,
};