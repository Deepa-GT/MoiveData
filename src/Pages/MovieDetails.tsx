import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Star, Calendar, Clock, DollarSign, Users, Play, X } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Loading from '../components/Loading';
import { getImageUrl, tmdbService } from '../services/tmdb';
import {
  movieApi, 
  MovieDetails as TMDBMovieDetails, 
  MovieCredit,
  MovieCredits,
  MovieVideo, 
  MovieImages, 
  MovieReview
} from '../services/movieApi';
import { Link } from 'react-router-dom';

interface MovieReviewsResponse {
  page: number;
  results: MovieReview[];
  total_pages: number;
  total_results: number;
}

interface MovieDetailsState {
  movie: TMDBMovieDetails | null;
  cast: MovieCredit[] | null;
  videos: MovieVideo[];
  images: MovieImages;
  reviews: MovieReview[];
  similarMovies: TMDBMovieDetails[];
  recommendations: TMDBMovieDetails[];
  loading: boolean;
  error: string | null;
  activeTab: 'trailers' | 'images';
  isVideoPlaying: boolean;
  activeVideoId: string | null;
  expandedReviews: Set<string>;
}

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<MovieDetailsState>({
    movie: null,
    cast: null,
    videos: [],
    images: {
      id: 0,
      backdrops: [],
      posters: [],
      logos: []
    },
    reviews: [],
    similarMovies: [],
    recommendations: [],
    loading: true,
    error: null,
    activeTab: 'trailers',
    isVideoPlaying: false,
    activeVideoId: null,
    expandedReviews: new Set()
  });

  useEffect(() => {
    const testApi = async () => {
      const isConnected = await tmdbService.testConnection();
      if (!isConnected) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to connect to TMDB API. Please check your API configuration.',
        }));
        return false;
      }
      return true;
    };

    const fetchMovieData = async () => {
      if (!id) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Test API connection first
        const isConnected = await testApi();
        if (!isConnected) return;

        const [
          movie,
          credits,
          videos,
          images,
          reviewsData,
          similarMoviesData,
          recommendationsData
        ] = await Promise.all([
          movieApi.getDetails(id),
          movieApi.getCredits(id),
          movieApi.getVideos(id),
          movieApi.getImages(id),
          movieApi.getReviews(id),
          movieApi.getSimilar(id),
          movieApi.getRecommendations(id)
        ]);

        const typedReviewsData = reviewsData as unknown as MovieReviewsResponse;

        setState(prev => ({
          ...prev,
          movie,
          cast: credits.cast.slice(0, 10),
          videos: videos.filter(video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')),
          images,
          reviews: typedReviewsData.results.slice(0, 5),
          similarMovies: similarMoviesData.results.slice(0, 6),
          recommendations: recommendationsData.results.slice(0, 6),
          loading: false,
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch movie data. Please try again later.',
        }));
        console.error('Error fetching movie data:', err);
      }
    };

    fetchMovieData();
  }, [id]);

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (state.loading) return <Loading />;
  if (state.error) return <div className="text-center text-red-500 p-4">{state.error}</div>;
  if (!state.movie) return <div className="text-center p-4">Movie not found</div>;

  const { movie, cast, videos, images, reviews, similarMovies, recommendations } = state;

    return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen bg-gray-900 text-white pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[70vh]"
        >
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
                  alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                {movie.title}
              </motion.h1>
              <div className="flex flex-wrap gap-4 mb-4">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 text-zinc-300 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>
                {movie.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span>{movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)</span>
                </div>
                </div>
              <p className="text-lg max-w-2xl mb-8">{movie.overview}</p>
              {videos.length > 0 && (
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      isVideoPlaying: true,
                      activeVideoId: videos[0].key,
                    }));
                  }}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Watch Trailer
                  </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4">
          {/* Movie Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8"
          >
            {movie.budget !== undefined && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-zinc-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget
                </h3>
                <p className="text-2xl font-semibold">{formatMoney(movie.budget)}</p>
              </div>
            )}
            {movie.revenue !== undefined && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-zinc-400 mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue
                </h3>
                <p className="text-2xl font-semibold">{formatMoney(movie.revenue)}</p>
              </div>
            )}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-zinc-400 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Rating
              </h3>
              <p className="text-2xl font-semibold">{movie.vote_average.toFixed(1)}/10</p>
                  </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-zinc-400 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Votes
              </h3>
              <p className="text-2xl font-semibold">{movie.vote_count.toLocaleString()}</p>
                </div>
          </motion.section>

          {/* Production Companies */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8"
            >
              <h2 className="text-2xl font-bold mb-6">Production Companies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movie.production_companies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-gray-800 p-6 rounded-lg flex flex-col items-center text-center"
                  >
                    {company.logo_path ? (
                      <div className="h-20 flex items-center mb-4">
                        <img
                          src={getImageUrl(company.logo_path)}
                          alt={company.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center mb-4">
                        <span className="text-4xl text-gray-500">🎬</span>
                      </div>
                    )}
                    <h3 className="font-semibold">{company.name}</h3>
                    {company.origin_country && (
                      <span className="text-sm text-gray-400 mt-1">{company.origin_country}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Cast Section */}
          {cast && cast.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-3xl font-bold mb-8">Cast</h2>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={2}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                }}
              >
                {cast.map((member) => (
                  <SwiperSlide key={member.id}>
                    <Link to={`/actor/${member.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative aspect-[2/3] rounded-lg overflow-hidden"
                      >
                        <img
                          src={getImageUrl(member.profile_path)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-300">{member.character}</p>
                        </div>
                      </motion.div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.section>
          )}

          {/* Media Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="flex gap-4 mb-8">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.activeTab === 'trailers' ? 'bg-red-600' : 'bg-gray-800'
                }`}
                onClick={() => setState(prev => ({ ...prev, activeTab: 'trailers' }))}
              >
                Trailers ({videos.length})
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.activeTab === 'images' ? 'bg-red-600' : 'bg-gray-800'
                }`}
                onClick={() => setState(prev => ({ ...prev, activeTab: 'images' }))}
              >
                Images ({images.backdrops.length})
              </button>
            </div>
  
            <AnimatePresence mode="wait">
              {state.activeTab === 'trailers' ? (
                <motion.div
                  key="trailers"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {videos.length > 0 ? (
                    <Swiper
                      modules={[Autoplay, Navigation, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 5000 }}
                    >
                      {videos.map((video) => (
                        <SwiperSlide key={video.id}>
                          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${video.key}`}
                              title={video.name}
                              className="w-full h-full"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">No trailers available</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="images"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {images.backdrops.length > 0 ? (
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                      }}
                    >
                      {images.backdrops.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-800">
                            <img
                              src={getImageUrl(image.file_path, 'original')}
                              alt={`Scene ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">No images available</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-3xl font-bold mb-8">Reviews</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 p-6 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {review.author_details?.avatar_path ? (
                          <img
                            src={getImageUrl(review.author_details.avatar_path)}
                            alt={review.author}
                            className="w-10 h-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/avatar-placeholder.jpg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xl">
                              {review.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{review.author}</h3>
                          <span className="text-sm text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.author_details?.rating && (
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" />
                          {review.author_details.rating}/10
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <p className={`text-gray-300 ${
                        state.expandedReviews.has(review.id) ? '' : 'line-clamp-4'
                      }`}>
                        {review.content}
                      </p>
                      {review.content.length > 300 && (
                        <motion.button
                          onClick={() => {
                            setState(prev => {
                              const newExpandedReviews = new Set(prev.expandedReviews);
                              if (newExpandedReviews.has(review.id)) {
                                newExpandedReviews.delete(review.id);
                              } else {
                                newExpandedReviews.add(review.id);
                              }
                              return { ...prev, expandedReviews: newExpandedReviews };
                            });
                          }}
                          className="mt-2 text-yellow-500 hover:text-yellow-400 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {state.expandedReviews.has(review.id) ? 'Show Less' : 'Read More'}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Similar Movies Section */}
          {state.similarMovies.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-3xl font-bold mb-8">Similar Movies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {state.similarMovies.map((movie) => (
                  <Link key={movie.id} to={`/movie/${movie.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden group"
                    >
                      <img
                        src={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.jpg'}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-sm">{movie.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Recommendations Section */}
          {state.recommendations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-3xl font-bold mb-8">Recommended Movies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {state.recommendations.map((movie) => (
                  <Link key={movie.id} to={`/movie/${movie.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden group"
                    >
                      <img
                        src={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.jpg'}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-sm">{movie.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Video Modal */}
        <AnimatePresence>
          {state.isVideoPlaying && state.activeVideoId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setState(prev => ({ ...prev, isVideoPlaying: false, activeVideoId: null }))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setState(prev => ({ ...prev, isVideoPlaying: false, activeVideoId: null }));
                }
              }}
              tabIndex={0}
              role="dialog"
              aria-modal="true"
              aria-labelledby="video-modal-title"
            >
              <div 
                className="w-full max-w-5xl aspect-video relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setState(prev => ({ ...prev, isVideoPlaying: false, activeVideoId: null }))}
                  className="absolute -top-12 right-0 text-white hover:text-yellow-500 transition-colors"
                  aria-label="Close video"
                >
                  <X className="w-8 h-8" />
                </button>
                <iframe
                  src={`https://www.youtube.com/embed/${state.activeVideoId}?autoplay=1`}
                  title="Movie Trailer"
                  id="video-modal-title"
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
    );
  };
  
  export default MovieDetails;