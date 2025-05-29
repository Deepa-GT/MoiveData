import { tmdbApi, TMDBError } from './tmdb';

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  status?: string;
  budget?: number;
  revenue?: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  tagline?: string;
  imdb_id?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
}

export interface MovieCredit {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id?: number;
  character?: string;
  credit_id: string;
  order?: number;
  department?: string;
  job?: string;
}

export interface MovieCredits {
  id: number;
  cast: MovieCredit[];
  crew: MovieCredit[];
}

export interface MovieVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface MovieReview {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface MovieImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface MovieImages {
  id: number;
  backdrops: MovieImage[];
  posters: MovieImage[];
  logos: MovieImage[];
}

export interface MovieListResult {
  page: number;
  results: MovieDetails[];
  total_pages: number;
  total_results: number;
}

export interface MovieKeyword {
  id: number;
  name: string;
}

export interface MovieKeywords {
  id: number;
  keywords: MovieKeyword[];
}

export interface MovieWatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface MovieWatchProviders {
  id: number;
  results: {
    [country: string]: {
      link: string;
      rent?: MovieWatchProvider[];
      buy?: MovieWatchProvider[];
      flatrate?: MovieWatchProvider[];
    };
  };
}

export const movieApi = {
 
  getDetails: async (movieId: string | number, appendToResponse?: string[]) => {
    try {
      const response = await tmdbApi.get<MovieDetails>(`/movie/${movieId}`, {
        params: {
          append_to_response: appendToResponse?.join(','),
        },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie details');
    }
  },

 
  getCredits: async (movieId: string | number) => {
    try {
      const response = await tmdbApi.get<MovieCredits>(`/movie/${movieId}/credits`);
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie credits');
    }
  },

  
  getVideos: async (movieId: string | number) => {
    try {
      const response = await tmdbApi.get<{ results: MovieVideo[] }>(`/movie/${movieId}/videos`);
      return response.data.results;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie videos');
    }
  },

  getImages: async (movieId: string | number, includeLanguage?: string) => {
    try {
      const response = await tmdbApi.get<MovieImages>(`/movie/${movieId}/images`, {
        params: {
          include_image_language: includeLanguage,
        },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie images');
    }
  },

  
  getReviews: async (movieId: string | number, page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>(`/movie/${movieId}/reviews`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie reviews');
    }
  },

 
  getSimilar: async (movieId: string | number, page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>(`/movie/${movieId}/similar`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch similar movies');
    }
  },

  
  getRecommendations: async (movieId: string | number, page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>(`/movie/${movieId}/recommendations`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie recommendations');
    }
  },

 
  getKeywords: async (movieId: string | number) => {
    try {
      const response = await tmdbApi.get<MovieKeywords>(`/movie/${movieId}/keywords`);
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie keywords');
    }
  },

  
  getWatchProviders: async (movieId: string | number) => {
    try {
      const response = await tmdbApi.get<MovieWatchProviders>(`/movie/${movieId}/watch/providers`);
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch movie watch providers');
    }
  },

  searchMovies: async (query: string, page: number = 1, includeAdult: boolean = false) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/search/movie', {
        params: {
          query,
          page,
          include_adult: includeAdult,
        },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to search movies');
    }
  },

  
  getTrending: async (page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/trending/movie/week', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch trending movies');
    }
  },

 
  getNowPlaying: async (page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/movie/now_playing', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch now playing movies');
    }
  },

 
  getPopular: async (page: number = 1, region?: string) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/movie/popular', {
        params: { page, region },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch popular movies');
    }
  },

  getTopRated: async (page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/movie/top_rated', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch top rated movies');
    }
  },

  
  getUpcoming: async (page: number = 1) => {
    try {
      const response = await tmdbApi.get<MovieListResult>('/movie/upcoming', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch upcoming movies');
    }
  },

 
  formatMovieData: (movie: MovieDetails) => {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      runtime: movie.runtime,
      status: movie.status,
      genres: movie.genres,
      budget: movie.budget,
      revenue: movie.revenue,
      tagline: movie.tagline,
      imdbId: movie.imdb_id,
    };
  },
}; 