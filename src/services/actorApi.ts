import { tmdbApi, TMDBPerson, TMDBError } from './tmdb';

export interface ActorDetails {
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
  profile_path: string;
}

export interface ActorMovieCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface ActorTVCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  episode_count: number;
}

export interface ActorCombinedCredits {
  cast: (ActorMovieCredit | ActorTVCredit)[];
  crew: any[]; // Add crew type if needed
}

export interface ActorSocialMedia {
  id: number;
  freebase_mid: string | null;
  freebase_id: string | null;
  imdb_id: string | null;
  tvrage_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

export interface ActorTaggedImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  id: string;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
  image_type: string;
  media: {
    id: number;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    release_date?: string;
    first_air_date?: string;
  };
  media_type: 'movie' | 'tv';
}

export interface Actor {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  also_known_as: string[];
}

export interface MovieCredit {
  id: number;
  title: string;
  character: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  popularity: number;
}

export interface ActorCredits {
  cast: MovieCredit[];
  crew: MovieCredit[];
}

export const actorApi = {
  // Get detailed actor information
  getActorDetails: async (actorId: string): Promise<Actor> => {
    try {
      const response = await tmdbApi.get<Actor>(`/person/${actorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actor details:', error);
      throw error;
    }
  },

  // Get actor's movie credits
  getActorMovieCredits: async (actorId: string): Promise<{ cast: ActorMovieCredit[] }> => {
    try {
      const response = await tmdbApi.get<{ cast: ActorMovieCredit[] }>(`/person/${actorId}/movie_credits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actor movie credits:', error);
      throw error;
    }
  },

  // Get actor's images
  getActorImages: async (actorId: string) => {
    try {
      const response = await tmdbApi.get(`/person/${actorId}/images`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actor images:', error);
      throw error;
    }
  },

  // Search for actors
  searchActors: async (query: string, page: number = 1) => {
    try {
      const response = await tmdbApi.get('/search/person', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching actors:', error);
      throw error;
    }
  },

  // Get actor details
  getDetails: async (personId: string | number): Promise<TMDBPerson> => {
    try {
      const response = await tmdbApi.get<TMDBPerson>(`/person/${personId}`);
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor details');
    }
  },

  // Get actor movie credits
  getMovieCredits: async (personId: string | number) => {
    try {
      const response = await tmdbApi.get<{ cast: ActorMovieCredit[] }>(
        `/person/${personId}/movie_credits`
      );
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor movie credits');
    }
  },

  // Get actor TV credits
  getTVCredits: async (personId: string | number) => {
    try {
      const response = await tmdbApi.get<{ cast: ActorTVCredit[] }>(
        `/person/${personId}/tv_credits`
      );
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor TV credits');
    }
  },

  // Get combined credits (movies and TV shows)
  getCombinedCredits: async (personId: string | number) => {
    try {
      const response = await tmdbApi.get<ActorCombinedCredits>(
        `/person/${personId}/combined_credits`
      );
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor combined credits');
    }
  },

  // Get actor's external IDs (social media, IMDb, etc.)
  getExternalIds: async (personId: string | number) => {
    try {
      const response = await tmdbApi.get<ActorSocialMedia>(
        `/person/${personId}/external_ids`
      );
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor external IDs');
    }
  },

  // Get actor's tagged images
  getTaggedImages: async (personId: string | number, page: number = 1) => {
    try {
      const response = await tmdbApi.get<{
        page: number;
        results: ActorTaggedImage[];
        total_pages: number;
        total_results: number;
      }>(`/person/${personId}/tagged_images`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor tagged images');
    }
  },

  // Get popular actors
  getPopularActors: async (page: number = 1) => {
    try {
      const response = await tmdbApi.get('/person/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch popular actors');
    }
  },

  // Get actor's latest changes
  getChanges: async (personId: string | number, startDate?: string, endDate?: string) => {
    try {
      const response = await tmdbApi.get(`/person/${personId}/changes`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      throw new TMDBError('Failed to fetch actor changes');
    }
  },

  // Helper function to get formatted filmography
  getFormattedFilmography: async (personId: string | number) => {
    try {
      const credits = await actorApi.getCombinedCredits(personId);
      
      // Sort by release date/first air date
      const sortedCredits = credits.cast.sort((a, b) => {
        const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
        const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
        return new Date(dateB || '').getTime() - new Date(dateA || '').getTime();
      });

      // Group by media type
      const filmography = {
        movies: sortedCredits.filter((credit): credit is ActorMovieCredit => 
          'release_date' in credit && credit.release_date !== null
        ),
        tvShows: sortedCredits.filter((credit): credit is ActorTVCredit => 
          'first_air_date' in credit && credit.first_air_date !== null
        ),
      };

      return filmography;
    } catch (error) {
      throw new TMDBError('Failed to format filmography');
    }
  },
}; 