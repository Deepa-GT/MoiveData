import { Star } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { MovieDetails } from "../services/movieApi";
import { getImageUrl } from "../services/tmdb";

const MovieCard: React.FC<{ movie: MovieDetails }> = ({ movie }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsLoading(true);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div 
        onClick={handleClick}
        className="bg-zinc-900/50 rounded-xl overflow-hidden movie-card-hover backdrop-blur-sm cursor-pointer"
      >
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.jpg'}
            alt={movie.title}
            className="w-full h-full object-cover hover-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 p-4 w-full">
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                View Details
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-yellow-500 font-medium">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg truncate text-glow">{movie.title}</h3>
            <span className="text-zinc-400 text-sm">
              {new Date(movie.release_date).getFullYear()}
            </span>
          </div>
          {movie.genres && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MovieCard;