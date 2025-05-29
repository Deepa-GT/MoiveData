import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Actor, MovieCredit, actorApi } from '../services/actorApi';
//import { IMDbBio, imdbService } from '../services/imdbApi';
import { getImageUrl } from '../services/tmdb';

interface SocialMedia {
  imdb_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

type SortOption = 'year-desc' | 'year-asc' | 'rating-desc' | 'rating-asc';

interface ExtendedBio {
  tmdb: string | null;
  imdb: Array<{
    text: string;
    author: string;
  }>;
  trademarks: string[];
}

const ActorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actor, setActor] = useState<Actor | null>(null);
  const [movies, setMovies] = useState<MovieCredit[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia | null>(null);
  const [extendedBio, setExtendedBio] = useState<ExtendedBio>({
    tmdb: null,
    imdb: [],
    trademarks: []
  });
  const [sortBy, setSortBy] = useState<SortOption>('year-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tmdb' | 'imdb'>('tmdb');

  useEffect(() => {
    const fetchActorData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [actorData, creditsData, socialData] = await Promise.all([
          actorApi.getActorDetails(id),
          actorApi.getActorMovieCredits(id),
          actorApi.getExternalIds(id)
        ]);

        setActor(actorData);
        setSocialMedia(socialData);
        setExtendedBio(prev => ({ ...prev, tmdb: actorData.biography }));

        // Sort movies by release date (newest first) and popularity
        const sortedMovies = creditsData.cast
          .sort((a, b) => {
            if (!a.release_date) return 1;
            if (!b.release_date) return -1;
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
          })
          .filter(movie => movie.poster_path);

        setMovies(sortedMovies);

        // Fetch IMDb bio if IMDb ID is available
        // if (socialData.imdb_id) {
        //   try {
        //     const imdbBio = await imdbService.getActorBio(socialData.imdb_id);
        //     setExtendedBio(prev => ({
        //       ...prev,
        //       imdb: imdbBio.miniBios.map(bio => ({
        //         text: bio.text,
        //         author: bio.author
        //       })),
        //       trademarks: imdbBio.trademarks || []
        //     }));
        //   } catch (imdbError) {
        //     console.error('Error fetching IMDb bio:', imdbError);
        //   }
        // }
      } catch (err) {
        setError('Failed to load actor information. Please try again later.');
        console.error('Error loading actor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [id]);

  const sortedAndFilteredMovies = React.useMemo(() => {
    let filtered = movies;
    
    // Apply search filter
    if (searchQuery) {
      filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.character.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'year-desc':
          return new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime();
        case 'year-asc':
          return new Date(a.release_date || '').getTime() - new Date(b.release_date || '').getTime();
        case 'rating-desc':
          return b.vote_average - a.vote_average;
        case 'rating-asc':
          return a.vote_average - b.vote_average;
        default:
          return 0;
      }
    });
  }, [movies, sortBy, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error || 'Actor not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Actor Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Profile Image */}
        <div className="md:col-span-1">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={actor.profile_path ? getImageUrl(actor.profile_path, 'original') : '/placeholder-actor.jpg'}
              alt={actor.name}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Personal Info */}
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Info</h3>
            <div className="space-y-4">
              {actor.birthday && (
                <div>
                  <h4 className="text-gray-400">Birthday</h4>
                  <p>{new Date(actor.birthday).toLocaleDateString()}</p>
                </div>
              )}
              {actor.place_of_birth && (
                <div>
                  <h4 className="text-gray-400">Place of Birth</h4>
                  <p>{actor.place_of_birth}</p>
                </div>
              )}
              {actor.also_known_as.length > 0 && (
                <div>
                  <h4 className="text-gray-400">Also Known As</h4>
                  <ul className="list-none">
                    {actor.also_known_as.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Social Media Links */}
              {socialMedia && (
                <div className="mt-6">
                  <h4 className="text-gray-400 mb-3">Social Media</h4>
                  <div className="flex gap-4">
                    {socialMedia.imdb_id && (
                      <a
                        href={`https://www.imdb.com/name/${socialMedia.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500 hover:text-yellow-400 transition-colors"
                      >
                        IMDb
                      </a>
                    )}
                    {socialMedia.instagram_id && (
                      <a
                        href={`https://www.instagram.com/${socialMedia.instagram_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-500 hover:text-pink-400 transition-colors"
                      >
                        Instagram
                      </a>
                    )}
                    {socialMedia.twitter_id && (
                      <a
                        href={`https://twitter.com/${socialMedia.twitter_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Twitter
                      </a>
                    )}
                    {socialMedia.facebook_id && (
                      <a
                        href={`https://facebook.com/${socialMedia.facebook_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-gray-400 text-sm">Total Movies</h4>
                <p className="text-2xl font-bold text-yellow-500">{movies.length}</p>
              </div>
              <div>
                <h4 className="text-gray-400 text-sm">Popularity</h4>
                <p className="text-2xl font-bold text-yellow-500">
                  {actor.popularity.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Biography and Movies */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{actor.name}</h1>
          
          {/* Biography with Tabs */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Biography</h2>
            
            {/* Biography Tabs */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab('tmdb')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tmdb'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                TMDB Bio
              </button>
              {extendedBio.imdb.length > 0 && (
                <button
                  onClick={() => setActiveTab('imdb')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'imdb'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  IMDb Bio
                </button>
              )}
            </div>

            {/* Biography Content */}
            <div className="bg-gray-800 rounded-lg p-6">
              {activeTab === 'tmdb' ? (
                <p className="text-gray-300 whitespace-pre-line">
                  {extendedBio.tmdb || 'No biography available.'}
                </p>
              ) : (
                <div className="space-y-6">
                  {extendedBio.imdb.map((bio, index) => (
                    <div key={index} className="border-b border-gray-700 pb-6 last:border-0">
                      <p className="text-gray-300 whitespace-pre-line mb-2">{bio.text}</p>
                      <p className="text-sm text-gray-400">- {bio.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trademarks */}
            {activeTab === 'imdb' && extendedBio.trademarks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Trademarks</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {extendedBio.trademarks.map((trademark, index) => (
                    <li key={index}>{trademark}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Known For */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movies.slice(0, 8).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg overflow-hidden transition-transform hover:scale-105"
                >
                  <img
                    src={getImageUrl(movie.poster_path!, 'w500')}
                    alt={movie.title}
                    className="w-full h-auto"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">{movie.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                    </p>
                    {movie.character && (
                      <p className="text-yellow-500 text-sm mt-1">as {movie.character}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Filmography */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-semibold">Complete Filmography</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="year-desc">Newest First</option>
              <option value="year-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Character</th>
                <th className="px-6 py-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredMovies.map((movie) => (
                <tr key={movie.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : 'TBA'}
                  </td>
                  <td className="px-6 py-4">{movie.title}</td>
                  <td className="px-6 py-4 text-yellow-500">{movie.character}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {movie.vote_average.toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No Results Message */}
          {sortedAndFilteredMovies.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActorProfile; 