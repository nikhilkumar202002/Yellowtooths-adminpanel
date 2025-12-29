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

export const getAllPosters = async (
  page: number = 1, 
  search: string = '', 
  year: string = ''
): Promise<PaginatedResponse<FilmPoster>> => {
  try {
    const token = localStorage.getItem('token');
    
    // Build Query Parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search); // Sending search to backend
    if (year && year !== 'All') params.append('year', year); // Sending year to backend

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
// Poster single view

export const getPosterById = async (id: string | number): Promise<FilmPoster> => {
  try {
    const response = await api.get(`/film-poster-designs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// create poster

// Service function to create a new poster
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


// 4. Delete Poster 
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

// 4. Update (POST + _method: PUT)
export const updatePoster = async (id: string | number, posterData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    // Ensure _method is set to PUT so backend treats it as an update
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


// Employee Apis
export const getAllEmployees = async (
  page: number = 1, 
  search: string = ''
): Promise<PaginatedResponse<Employee>> => {
  try {
    const token = localStorage.getItem('token');
    
    // Build query params
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

// 2. Create Employee (NEW)
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