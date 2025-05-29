import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Star, TrendingUp, Film, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import MovieCarousel from "../components/MovieCarousel";
import { movieApi, MovieDetails } from "../services/movieApi";
import LoadingSpinner from "../components/LoadingSpinner";

interface HomeState {
  trendingMovies: MovieDetails[];
  upcomingMovies: MovieDetails[];
  topRatedMovies: MovieDetails[];
  nowPlayingMovies: MovieDetails[];
  genres: Array<{ id: number; name: string }>;
  loading: {
    trending: boolean;
    upcoming: boolean;
    topRated: boolean;
    nowPlaying: boolean;
  };
  error: string | null;
}

const Home: React.FC = () => {
  const [state, setState] = useState<HomeState>({
    trendingMovies: [],
    upcomingMovies: [],
    topRatedMovies: [],
    nowPlayingMovies: [],
    genres: [],
    loading: {
      trending: true,
      upcoming: true,
      topRated: true,
      nowPlaying: true
    },
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const genresResponse = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=6ab98d239b1f508b4ded3346fc0c3b1c`
        );
        const genresData = await genresResponse.json();

        const [trending, upcoming, topRated, nowPlaying] = await Promise.all([
          movieApi.getTrending(),
          movieApi.getUpcoming(),
          movieApi.getTopRated(),
          movieApi.getNowPlaying()
        ]);

        
        const addGenresToMovie = (movie: any): MovieDetails => {
          const movieGenres = movie.genre_ids.map((id: number) => 
            genresData.genres.find((g: any) => g.id === id)
          ).filter(Boolean);

          return {
            ...movie,
            genres: movieGenres
          };
        };

        setState(prev => ({
          ...prev,
          genres: genresData.genres,
          trendingMovies: trending.results.slice(0, 10).map(addGenresToMovie),
          upcomingMovies: upcoming.results.slice(0, 10).map(addGenresToMovie),
          topRatedMovies: topRated.results.slice(0, 10).map(addGenresToMovie),
          nowPlayingMovies: nowPlaying.results.slice(0, 10).map(addGenresToMovie),
          loading: {
            trending: false,
            upcoming: false,
            topRated: false,
            nowPlaying: false
          }
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: "Failed to fetch movies. Please try again later.",
          loading: {
            trending: false,
            upcoming: false,
            topRated: false,
            nowPlaying: false
          }
        }));
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const categories = [
    {
      icon: TrendingUp,
      label: "Trending",
      path: "/movies?sort=trending",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      movies: state.trendingMovies,
      loading: state.loading.trending
    },
    {
      icon: Star,
      label: "Top Rated",
      path: "/top-rated",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      movies: state.topRatedMovies,
      loading: state.loading.topRated
    },
    {
      icon: Clock,
      label: "Coming Soon",
      path: "/comingsoon",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      movies: state.upcomingMovies,
      loading: state.loading.upcoming
    },
    {
      icon: Film,
      label: "Now Playing",
      path: "/now-playing",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      movies: state.nowPlayingMovies,
      loading: state.loading.nowPlaying
    }
  ];

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-400 text-center">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.path}
              className="relative group"
            >
              <motion.div
                className={`${category.color} p-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:scale-105 shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <category.icon className="w-6 h-6" />
                <span className="font-medium text-center">{category.label}</span>
                {category.movies.length > 0 && (
                  <span className="text-sm opacity-75">
                    {category.movies.length} movies
                  </span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {categories.map((category, index) => (
            <motion.section
              key={category.label}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                  <category.icon className="w-6 h-6 text-yellow-500" />
                  {category.label}
            </h2>
                <Link
                  to={category.path}
                  className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
                >
              View All
                  <Calendar className="w-4 h-4" />
            </Link>
          </div>
              {category.loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
          </div>
              ) : (
                <MovieCarousel movies={category.movies} />
              )}
            </motion.section>
          ))}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;