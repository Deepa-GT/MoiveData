import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Actor, MovieCredit, actorApi } from '../services/actorApi';
import { getImageUrl } from '../services/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';
import { Film, Calendar, Star, TrendingUp, Search } from 'lucide-react';

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

const MovieGrid = React.lazy(() => import('../components/MovieGrid'));

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
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

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
    
    
    if (searchQuery) {
      filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.character.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

  
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

  const renderMovieGrid = () => (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="space-y-6">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-800/50 p-4 rounded-lg">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          >
            <option value="year-desc">Newest First</option>
            <option value="year-asc">Oldest First</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
          </select>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredMovies.map((movie) => (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </Suspense>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Profile Image Section */}
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: isImageLoaded ? 1 : 0,
              scale: isImageLoaded ? 1 : 0.9
            }}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={actor.profile_path ? getImageUrl(actor.profile_path, 'original') : '/placeholder-actor.jpg'}
              alt={actor.name}
              className="w-full h-auto object-cover transition-opacity duration-300"
              onLoad={() => setIsImageLoaded(true)}
              style={{ opacity: isImageLoaded ? 1 : 0 }}
            />
          </motion.div>
          
         
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

       
       
        <div className="md:col-span-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            {actor.name}
          </motion.h1>
          
         
         
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Biography</h2>
            
            
            
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

         
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Film className="w-6 h-6" />
              Filmography
              <span className="text-sm font-normal text-gray-400">
                ({sortedAndFilteredMovies.length} movies)
              </span>
            </h2>
            {renderMovieGrid()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActorProfile; 