import axios, { AxiosError } from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB API key is not configured. Please set REACT_APP_TMDB_API_KEY in your environment variables.');
}

export enum TMDBErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export class TMDBError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorType: TMDBErrorType = TMDBErrorType.UNKNOWN,
    public response?: any
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  },
  headers: {
    'Content-Type': 'application/json'
  },
});

tmdbApi.interceptors.request.use(request => {
  // Remove api_key from logs for security
  const sanitizedUrl = request.url?.replace(/api_key=[^&]+/, 'api_key=HIDDEN');
  console.log('API Request:', sanitizedUrl);
  return request;
});

tmdbApi.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url?.replace(/api_key=[^&]+/, 'api_key=HIDDEN'));
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url?.replace(/api_key=[^&]+/, 'api_key=HIDDEN'),
      status: error.response?.status,
      message: error.response?.data
    });

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          throw new TMDBError(
            'Authentication failed. Please check your API key.',
            status,
            TMDBErrorType.AUTHENTICATION,
            data
          );
        case 404:
          throw new TMDBError(
            'The requested resource was not found.',
            status,
            TMDBErrorType.NOT_FOUND,
            data
          );
        case 429:
          throw new TMDBError(
            'Rate limit exceeded. Please try again later.',
            status,
            TMDBErrorType.RATE_LIMIT,
            data
          );
        case 500:
        case 502:
        case 503:
        case 504:
          throw new TMDBError(
            'TMDB server error. Please try again later.',
            status,
            TMDBErrorType.SERVER_ERROR,
            data
          );
        default:
          throw new TMDBError(
            data?.status_message || 'An unknown error occurred',
            status,
            TMDBErrorType.UNKNOWN,
            data
          );
      }
    }
    
    throw new TMDBError(
      'Network error. Please check your internet connection.',
      undefined,
      TMDBErrorType.NETWORK_ERROR
    );
  }
);

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  status: string;
  tagline: string | null;
  budget: number;
  revenue: number;
  original_language: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
}

export interface TMDBPerson {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TMDBResponse<T> {
  page?: number;
  results: T[];
  total_pages?: number;
  total_results?: number;
}

export const tmdbService = {
  // Test connection
  testConnection: async () => {
    try {
      const response = await tmdbApi.get('/movie/popular');
      console.log('TMDB API Connection Test:', {
        status: response.status,
        totalResults: response.data.total_results,
        firstMovie: response.data.results[0]?.title
      });
      return true;
    } catch (error) {
      console.error('TMDB API Connection Test Failed:', error);
      return false;
    }
  },

  getMovieDetails: async (movieId: string) => {
    try {
      const response = await tmdbApi.get<TMDBMovie>(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      if (error instanceof TMDBError) {
        throw error;
      }
      throw new TMDBError('Failed to fetch movie details');
    }
  },

  getMovieCredits: async (movieId: string) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/credits`);
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie credits');
    }
  },

  getMovieVideos: async (movieId: string) => {
    try {
      const response = await tmdbApi.get<TMDBResponse<TMDBVideo>>(`/movie/${movieId}/videos`);
      return response.data.results;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie videos');
    }
  },

  getMovieImages: async (movieId: string) => {
    try {
      const response = await tmdbApi.get<{ backdrops: TMDBImage[]; posters: TMDBImage[] }>(
        `/movie/${movieId}/images`
      );
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie images');
    }
  },

  getMovieReviews: async (movieId: string) => {
    try {
      const response = await tmdbApi.get<TMDBResponse<TMDBReview>>(`/movie/${movieId}/reviews`);
      return response.data.results;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie reviews');
    }
  },

  
  getPersonDetails: async (personId: string) => {
    const response = await tmdbApi.get<TMDBPerson>(`/person/${personId}`);
    return response.data;
  },

  getPersonMovieCredits: async (personId: string) => {
    const response = await tmdbApi.get(`/person/${personId}/movie_credits`);
    return response.data;
  },

 
  searchMovies: async (query: string, page: number = 1) => {
    try {
      const response = await tmdbApi.get<TMDBResponse<TMDBMovie>>('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to search movies');
    }
  },

  searchPeople: async (query: string, page: number = 1) => {
    try {
      const response = await tmdbApi.get<TMDBResponse<TMDBPerson>>('/search/person', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to search people');
    }
  },
};

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder-image.jpg'; 
  return `https://image.tmdb.org/t/p/${size}${path}`;
}; 