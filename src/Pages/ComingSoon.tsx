import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { movieApi, MovieDetails } from '../services/movieApi';
import { getImageUrl } from '../services/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';

const ComingSoon: React.FC = () => {
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        setLoading(true);
        const data = await movieApi.getUpcoming(page);
        setMovies(prevMovies => [...prevMovies, ...data.results]);
        setTotalPages(data.total_pages);
      } catch (err) {
        setError('Failed to fetch upcoming movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, [page]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-8 text-center"
          >
            Coming Soon
          </motion.h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="wait" initial={false}>
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <Link to={`/movie/${movie.id}`}>
                    <div className="relative aspect-[2/3]">
                      <img
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h2 className="text-xl font-semibold text-white mb-2">
                            {movie.title}
                          </h2>
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <span>
                              {new Date(movie.release_date).toLocaleDateString(undefined, {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {movie.vote_average > 0 && (
                              <>
                                <span>•</span>
                                <span>⭐ {movie.vote_average.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {movie.overview}
                      </p>
                      {movie.genres && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {movie.genres.slice(0, 3).map(genre => (
                            <span
                              key={genre.id}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {loading && (
            <div className="flex justify-center mt-8">
              <LoadingSpinner />
            </div>
          )}

          {!loading && page < totalPages && (
            <div className="flex justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMore}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Load More
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
};

export default ComingSoon;
