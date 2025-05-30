import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LazyMotion, domAnimation } from "framer-motion";
import { movieApi, MovieDetails, MovieListResult } from "../services/movieApi";
import { getImageUrl } from "../services/tmdb";
import LoadingSpinner from "../components/LoadingSpinner";

interface Genre {
  id: number;
  name: string;
}

interface MovieListState {
  movies: MovieDetails[];
  genres: Genre[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  isFilterOpen: boolean;
}

const MovieList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(search || "");

  const [state, setState] = useState<MovieListState>({
    movies: [],
    genres: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1,
    isFilterOpen: false
  });

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
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
        let data: MovieListResult;
        if (search) {
          data = await movieApi.searchMovies(search, state.page);
        } else {
          data = await movieApi.getPopular(state.page);
        }

        setState(prev => ({
          ...prev,
          movies: data.results,
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
  }, [search, state.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    setState(prev => ({ ...prev, page: 1 }));
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedRating(null);
    setSelectedYear(null);
  };

  const genreMatch = (movie: MovieDetails) => {
    if (selectedGenres.length === 0) return true;
    if (!movie.genre_ids || !Array.isArray(movie.genre_ids)) return false;
    return selectedGenres.every(genreId => movie.genre_ids!.includes(genreId));
  };

  const ratingMatch = (movie: MovieDetails) =>
    !selectedRating || movie.vote_average >= selectedRating;

  const yearMatch = (movie: MovieDetails) =>
    !selectedYear ||
    (movie.release_date && new Date(movie.release_date).getFullYear().toString() === selectedYear);

  const filteredMovies = state.movies.filter(
    movie => genreMatch(movie) && ratingMatch(movie) && yearMatch(movie)
  );

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
    <LazyMotion features={domAnimation}>
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

        <AnimatePresence>
          {state.isFilterOpen ? (
            <motion.div
              key="filter-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All
        </button>
      </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {state.genres.map(genre => (
          <motion.button
                          key={genre.id}
            className={`px-3 py-1 rounded-full text-sm ${
                            selectedGenres.includes(genre.id)
                ? "bg-yellow-500 text-black"
                              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
                          onClick={() => toggleGenre(genre.id)}
                          whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
                          {genre.name}
          </motion.button>
        ))}
      </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Minimum Rating</h3>
                    <div className="flex flex-wrap gap-2">
                      {ratings.map(rating => (
          <motion.button
            key={rating}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedRating === rating
                ? "bg-yellow-500 text-black"
                              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
            onClick={() => setSelectedRating(rating)}
                          whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
                          {rating}+
          </motion.button>
        ))}
      </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Release Year</h3>
                    <div className="flex flex-wrap gap-2">
                      {years.slice(0, 10).map(year => (
          <motion.button
            key={year}
            className={`px-3 py-1 rounded-full text-sm ${
                            selectedYear === year.toString()
                ? "bg-yellow-500 text-black"
                              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
                          onClick={() => setSelectedYear(year.toString())}
                          whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {year}
          </motion.button>
        ))}
      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Movie Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Link to={`/movie/${movie.id}`}>
                <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg">
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
                    <h3 className="font-semibold text-lg mb-2">{movie.title}</h3>
                  <div className="flex gap-2">
                      {movie.genre_ids &&
                        movie.genre_ids.slice(0, 2).map(genreId => {
                          const genre = state.genres.find(g => g.id === genreId);
                          return genre ? (
                            <span
                              key={genre.id}
                              className="px-2 py-1 bg-gray-700 text-sm rounded-full"
                            >
                              {genre.name}
                      </span>
                          ) : null;
                        })}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No movies found matching your criteria.</p>
              </div>
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
    </LazyMotion>
  );
};

export default MovieList;
