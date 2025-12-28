import api from "./axios";

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

// Service function to fetch all posters
export const getAllPosters = async (): Promise<FilmPoster[]> => {
  try {
    const response = await api.get('/film-poster-designs/all');
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