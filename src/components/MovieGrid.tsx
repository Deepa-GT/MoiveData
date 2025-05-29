import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Star } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { MovieCredit } from '../services/actorApi';

interface MovieGridProps {
  movies: MovieCredit[];
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <Link to={`/movie/${movie.id}`} className="block">
            <div className="relative aspect-[2/3]">
              <img
                src={movie.poster_path ? getImageUrl(movie.poster_path, 'w500') : '/placeholder-movie.jpg'}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold line-clamp-2">{movie.title}</h3>
                <p className="text-sm text-gray-300">{movie.character}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default MovieGrid; 