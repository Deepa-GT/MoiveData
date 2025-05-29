import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Instagram, Star, Twitter } from 'lucide-react';
import { Actor, ActorMovieCredit, actorApi } from '../services/actorApi';
import { getImageUrl } from '../services/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';

interface ActorDetailsState {
  actor: Actor | null;
  movies: ActorMovieCredit[];
  socialMedia: {
    imdb_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

const ActorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<ActorDetailsState>({
    actor: null,
    movies: [],
    socialMedia: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchActorData = async () => {
      if (!id) return;
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const [actorData, creditsData, socialData] = await Promise.all([
          actorApi.getActorDetails(id),
          actorApi.getActorMovieCredits(id),
          actorApi.getExternalIds(id)
        ]);

        // Sort movies by popularity and filter out movies without posters
        const sortedMovies = creditsData.cast
          .sort((a, b) => b.popularity - a.popularity)
          .filter(movie => movie.poster_path);

        setState({
          actor: actorData,
          movies: sortedMovies,
          socialMedia: socialData,
          loading: false,
          error: null
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load actor information. Please try again later.'
        }));
        console.error('Error loading actor:', err);
      }
    };

    fetchActorData();
  }, [id]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error || !state.actor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{state.error || 'Actor not found'}</p>
          <Link
            to="/actors"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Actors
          </Link>
        </div>
      </div>
    );
  }

  const { actor, movies, socialMedia } = state;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${getImageUrl(movies[0]?.backdrop_path || '', 'original')})`,
              backgroundPosition: 'center 20%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
          </div>
          <div className="relative h-full container flex items-end pb-8">
            <div className="flex items-end gap-8">
              <img
                src={getImageUrl(actor.profile_path, 'original')}
                alt={actor.name}
                className="w-48 h-48 rounded-xl object-cover border-4 border-gray-900"
              />
              <div>
                <h1 className="text-4xl font-bold mb-4 text-white">{actor.name}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>{actor.popularity.toFixed(1)} Popularity</span>
                  </div>
                  {movies.length > 0 && (
                    <div className="flex items-center gap-2 text-white">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>{movies.length} Movies</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="font-semibold mb-4 text-white">Personal Info</h2>
                <dl className="space-y-4">
                  {actor.birthday && (
                    <div>
                      <dt className="text-gray-400">Born</dt>
                      <dd className="text-white">
                        {new Date(actor.birthday).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                  )}
                  {actor.place_of_birth && (
                    <div>
                      <dt className="text-gray-400">Place of Birth</dt>
                      <dd className="text-white">{actor.place_of_birth}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-400">Movies</dt>
                    <dd className="text-white">{movies.length} titles</dd>
                  </div>
                </dl>
              </div>
              {socialMedia && (socialMedia.instagram_id || socialMedia.twitter_id) && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="font-semibold mb-4 text-white">Social Media</h2>
                  <div className="flex gap-4">
                    {socialMedia.instagram_id && (
                      <a
                        href={`https://instagram.com/${socialMedia.instagram_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {socialMedia.twitter_id && (
                      <a
                        href={`https://twitter.com/${socialMedia.twitter_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Twitter className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-white">Biography</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {actor.biography || 'No biography available.'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Known For</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.slice(0, 6).map((movie) => (
                  <Link key={movie.id} to={`/movie/${movie.id}`}>
                    <div className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                      <div className="relative aspect-[2/3]">
                        <img
                          src={getImageUrl(movie.poster_path!, 'w500')}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-yellow-500 font-medium">
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 text-white">
                          {movie.title}
                        </h3>
                        <p className="text-gray-400">as {movie.character}</p>
                        <p className="text-gray-500 text-sm">
                          {movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : 'TBA'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetails;

