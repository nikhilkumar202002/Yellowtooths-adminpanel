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
    // Assuming the API returns an array directly, or response.data.data
    // Adjust '.data' based on if your API wraps the array in a 'data' property
    return response.data; 
  } catch (error) {
    throw error;
  }
};