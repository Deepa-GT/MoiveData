import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, Film, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { movieApi, MovieDetails } from "../services/movieApi";
import { getImageUrl } from "../services/tmdb";
import LoadingSpinner from "../components/LoadingSpinner";

interface Genre {
  id: number;
  name: string;
}

interface MovieListResponse {
  page: number;
  results: MovieDetails[];
  total_pages: number;
  total_results: number;
}

interface FilterChip {
  id: string;
  label: string;
  type: 'genre' | 'rating' | 'year';
  value: number | string;
}

interface MovieListState {
  movies: MovieDetails[];
  genres: Genre[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  isFilterOpen: boolean;
  activeFilters: FilterChip[];
}

const FilterChip: React.FC<{
  chip: FilterChip;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ chip, isActive, onToggle, className = '' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onToggle}
      aria-pressed={isActive}
      title={`Filter by ${chip.label}`}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20 hover:bg-yellow-400'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        }
        ${className}
      `}
    >
      {chip.label}
      {isActive && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <X className="w-3.5 h-3.5" />
        </motion.span>
      )}
    </motion.button>
  );
};

const MovieList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [searchQuery, setSearchQuery] = useState(search || "");

  const [state, setState] = useState<MovieListState>({
    movies: [],
    genres: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    isFilterOpen: false,
    activeFilters: []
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const ratings = [7, 7.5, 8, 8.5, 9];

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=6ab98d239b1f508b4ded3346fc0c3b1c`
        );
        const data = await response.json();
        setState(prev => ({ ...prev, genres: data.genres }));
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        let data: MovieListResponse;
        if (search) {
          data = await movieApi.searchMovies(search, state.page);
        } else {
          data = await movieApi.getPopular(state.page);
        }

        // Map genre_ids to full genre objects
        const moviesWithGenres = data.results.map(movie => ({
          ...movie,
          genres: movie.genre_ids
            ?.map(id => state.genres.find(genre => genre.id === id))
            .filter((genre): genre is { id: number; name: string } => genre !== undefined) || []
        }));

        setState(prev => ({
          ...prev,
          movies: moviesWithGenres,
          totalPages: Math.min(data.total_pages, 10),
          loading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: "Failed to fetch movies. Please try again later.",
          loading: false
        }));
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, [search, state.page, state.genres]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    setState(prev => ({ ...prev, page: 1, activeFilters: [] }));
  };

  const toggleFilter = (chip: FilterChip) => {
    setState(prev => {
      const isActive = prev.activeFilters.some(f => f.id === chip.id);
      const newFilters = isActive
        ? prev.activeFilters.filter(f => f.id !== chip.id)
        : [...prev.activeFilters, chip];
      return { ...prev, activeFilters: newFilters };
    });
  };

  const clearFilters = () => {
    setState(prev => ({ ...prev, activeFilters: [] }));
  };

  const filteredMovies = state.movies.filter(movie => {
    return state.activeFilters.every(filter => {
      switch (filter.type) {
        case 'genre':
          return movie.genres?.some(genre => genre.id === Number(filter.value)) ?? false;
        case 'rating':
          return movie.vote_average >= Number(filter.value);
        case 'year':
          return new Date(movie.release_date).getFullYear() === Number(filter.value);
        default:
          return true;
      }
    });
  });

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          {search ? `Search Results for "${search}"` : "Popular Movies"}
        </h1>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full md:w-64"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
          <button
            onClick={() => setState(prev => ({ ...prev, isFilterOpen: !prev.isFilterOpen }))}
            className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {state.activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            <span className="text-gray-400 text-sm">Active Filters:</span>
            {state.activeFilters.map(filter => (
              <FilterChip
                key={filter.id}
                chip={filter}
                isActive={true}
                onToggle={() => toggleFilter(filter)}
                className="shadow-md hover:shadow-lg"
              />
            ))}
            <motion.button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors ml-2 flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-3.5 h-3.5" />
              Clear All
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <Film className="w-4 h-4" />
                    </span>
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {state.genres.map(genre => (
                      <FilterChip
                        key={`genre-${genre.id}`}
                        chip={{
                          id: `genre-${genre.id}`,
                          label: genre.name,
                          type: 'genre',
                          value: genre.id
                        }}
                        isActive={state.activeFilters.some(f => f.id === `genre-${genre.id}`)}
                        onToggle={() => toggleFilter({
                          id: `genre-${genre.id}`,
                          label: genre.name,
                          type: 'genre',
                          value: genre.id
                        })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <Star className="w-4 h-4" />
                    </span>
                    Minimum Rating
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map(rating => (
                      <FilterChip
                        key={`rating-${rating}`}
                        chip={{
                          id: `rating-${rating}`,
                          label: `${rating}+`,
                          type: 'rating',
                          value: rating
                        }}
                        isActive={state.activeFilters.some(f => f.id === `rating-${rating}`)}
                        onToggle={() => toggleFilter({
                          id: `rating-${rating}`,
                          label: `${rating}+`,
                          type: 'rating',
                          value: rating
                        })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </span>
                    Release Year
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                      <FilterChip
                        key={`year-${year}`}
                        chip={{
                          id: `year-${year}`,
                          label: year.toString(),
                          type: 'year',
                          value: year
                        }}
                        isActive={state.activeFilters.some(f => f.id === `year-${year}`)}
                        onToggle={() => toggleFilter({
                          id: `year-${year}`,
                          label: year.toString(),
                          type: 'year',
                          value: year
                        })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMovies.map(movie => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="flex"
            >
              <Link to={`/movie/${movie.id}`} className="w-full">
                <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg h-full">
                  <div className="relative aspect-[2/3]">
                    <img
                      src={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-yellow-500 font-medium">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2 line-clamp-1">{movie.title}</h2>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                      <div className="flex gap-2">
                        {movie.genres?.slice(0, 2).map((genre) => (
                          <span
                            key={genre.id}
                            className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMovies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
        </motion.div>
      )}

      {/* Pagination */}
      {state.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setState(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={state.page === 1}
            className="flex items-center gap-1 px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <span className="text-gray-400">
            Page {state.page} of {state.totalPages}
          </span>
          <button
            onClick={() => setState(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={state.page === state.totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieList;
