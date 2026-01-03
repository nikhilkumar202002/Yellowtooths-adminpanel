import api from "./axios";

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PosterImage {
  id: number;
  film_poster_design_id: string;
  file_path: string;
  position: string;
}

// --- UPDATED INTERFACE ---
export interface FilmPoster {
  id: number;
  film_name: string;
  year: string;
  language: string;
  genre: string;
  imdb_rating: string;
  trailer_link: string;
  main_image: string;
  description: string;
  status: string;
  images: PosterImage[];
  // Added optional fields to fix TS errors
  position_number?: string | number; 
  type?: string; 
}

export interface PosterDesignListItem {
  id: number;
  film_name: string;
  position_number: number; 
}

export interface Employee {
  id: number;
  name: string;
  designation: string;
  photo: string; 
  status: string;
  position_number: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: number;
  name: string;       // Changed from client_name
  logo_path: string;  // Changed from client_logo
  status: string;
  created_at?: string;
  updated_at?: string;
}

// --- NEW: Contact Enquiry Interface ---
export interface ContactEnquiry {
  id: number;
  full_name: string;
  email_address: string;
  phone_number: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export const getAllPosters = async (
  page: number = 1, 
  search: string = '', 
  year: string = ''
): Promise<PaginatedResponse<FilmPoster>> => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search); 
    if (year && year !== 'All') params.append('year', year); 

    const response = await api.get(`/film-poster-designs?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export const getPosterDesignList = async (): Promise<PosterDesignListItem[]> => {
  const token = localStorage.getItem('token'); 
  const response = await api.get('/film-poster-designs/list', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getPosterById = async (id: string | number): Promise<FilmPoster> => {
  try {
    const response = await api.get(`/film-poster-designs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPoster = async (posterData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token'); 

    const response = await api.post('/film-poster-designs', posterData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}` 
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePosterOrder = async (updatedPosters: PosterDesignListItem[]) => {
  const token = localStorage.getItem('token'); 
  const positionArray = updatedPosters.map((item, index) => ({
    id: item.id,
    position_number: index + 1
  }));

  const payload = {
    positions: positionArray
  };

  const response = await api.put('/film-poster-designs/reorder', payload, {
    headers: {
      Authorization: `Bearer ${token}` 
    }
  });

  return response.data;
};

export const searchPosters = async (filmName: string) => {
  const token = localStorage.getItem('token');
  const response = await api.get('/film-poster-designs/search', {
    params: { film_name: filmName },
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};

export const deletePoster = async (id: number | string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/film-poster-designs/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBulkPosterImages = async (ids: (string | number)[]): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete('/film-poster-designs/images/bulk-delete', {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      data: { image_ids: ids } 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePoster = async (id: string | number, posterData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    posterData.append('_method', 'PUT'); 

    const response = await api.post(`/film-poster-designs/${id}`, posterData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) { throw error; }
};

// 8. Update Poster Status (Toggle)
export const updatePosterStatus = async (poster: FilmPoster, newStatus: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    formData.append('status', newStatus);
    
    formData.append('film_name', poster.film_name);
    formData.append('year', poster.year);
    formData.append('language', poster.language);
    formData.append('genre', poster.genre);
    formData.append('imdb_rating', poster.imdb_rating);
    // No more need for 'as any' since we added type? to interface
    formData.append('type', poster.type || 'Movie'); 

    if (poster.description) formData.append('description', poster.description);
    if (poster.trailer_link) formData.append('trailer_link', poster.trailer_link);
    
    // FIX: Convert to string to satisfy formData.append types if it is a number
    if (poster.position_number) {
        formData.append('position_number', poster.position_number.toString());
    }

    const response = await api.post(`/film-poster-designs/${poster.id}`, formData, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllEmployees = async (
  page: number = 1, 
  search: string = ''
): Promise<PaginatedResponse<Employee>> => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/employee-photos?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export const createEmployee = async (employeeData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.post('/employee-photos', employeeData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEmployee = async (id: number | string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/employee-photos/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// 1. Get All Clients
export const getAllClients = async (
  page: number = 1, 
  search: string = ''
): Promise<PaginatedResponse<Client>> => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    // Endpoint: GET /clients
    const response = await api.get(`/clients/all?${params.toString()}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    return response.data; 
  } catch (error) {
    throw error;
  }
};

// 2. Create Client
export const createClient = async (clientData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    
    // Endpoint: POST /client
    const response = await api.post('/client', clientData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteClient = async (id: number | string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    
    // Endpoint: DELETE /clients/{id}
    const response = await api.delete(`/clients/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 4. Get Client by ID (View Single Details)
export const getClientById = async (id: number | string): Promise<Client> => {
  try {
    const token = localStorage.getItem('token');
    // Endpoint: GET /clients/{id}
    const response = await api.get(`/clients/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 5. Update Client (NEW)
export const updateClient = async (id: number | string, clientData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    // Spoof PUT method for FormData/File upload support
    clientData.append('_method', 'PUT'); 

    // Endpoint: POST /clients/{id}
    const response = await api.post(`/clients/${id}`, clientData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) { throw error; }
};

// --- NEW: Get All Contact Enquiries ---
export const getAllContactEnquiries = async (
  page: number = 1,
  search: string = ''
): Promise<PaginatedResponse<ContactEnquiry>> => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    // Endpoint: GET /contact-enquiries
    const response = await api.get(`/contact-enquiries?${params.toString()}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    // --- Log the successful response ---
    console.log("Contact Enquiries API Response:", response.data); 
    
    return response.data; 
  } catch (error) {
    // --- Log the error details ---
    console.error("Failed to fetch contact enquiries:", error);
    throw error;
  }
};