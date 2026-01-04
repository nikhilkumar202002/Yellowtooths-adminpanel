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

// 1. Create User
export const createUser = async (userData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post("/users", userData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. List All Users (with optional pagination & search)
export const getAllUsers = async (page: number = 1, search: string = '') => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/users?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. View Single User
export const getUserById = async (id: number | string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/users/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- NEW: ROLE MANAGEMENT ENDPOINTS ---

// 1. Get All Roles
export const getAllRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get("/roles", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. Create Role
export const createRole = async (roleData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post("/roles", roleData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 3. View Single Role
export const getRoleById = async (id: number | string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get(`/roles/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4. Update Role
export const updateRole = async (id: number | string, roleData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.put(`/roles/${id}`, roleData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 5. Delete Role
export const deleteRole = async (id: number | string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/roles/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 6. Get Active Roles
export const getActiveRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get("/roles/active", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  login,
  logout,
  checkAuth,
  createUser,
  getAllUsers,
  getUserById,

  getAllRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getActiveRoles

};