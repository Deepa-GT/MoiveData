import { Star, Trophy } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { movieApi } from "../services/movieApi";
import { getImageUrl } from "../services/tmdb";
import LoadingSpinner from "../components/LoadingSpinner";

interface TopRatedState {
  movies: Array<{
    id: number;
    title: string;
    vote_average: number;
    poster_path: string | null;
    release_date: string;
    vote_count: number;
  }>;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
}

const Toprated: React.FC = () => {
  const [state, setState] = useState<TopRatedState>({
    movies: [],
    loading: true,
    error: null,
    page: 1,
    totalPages: 1
  });

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        const data = await movieApi.getTopRated(state.page);
        setState(prev => ({
          ...prev,
          movies: data.results,
          totalPages: data.total_pages,
          loading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch top rated movies. Please try again later.',
          loading: false
        }));
        console.error('Error fetching top rated movies:', error);
      }
    };

    fetchTopRatedMovies();
  }, [state.page]);

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Top Rated Movies</h1>
      </motion.div>
      <div className="space-y-6">
        {state.movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link to={`/movie/${movie.id}`}>
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex">
                  <div className="w-16 bg-yellow-500 flex items-center justify-center text-black font-bold text-xl">
                    #{index + 1}
                  </div>
                  <div className="relative w-48 h-72">
                    <img
                      src={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {movie.title}
                      </h2>
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 dark:text-gray-200">
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                      <span className="mx-2">•</span>
                      <span>{movie.vote_count.toLocaleString()} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Toprated; 