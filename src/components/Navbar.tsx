import { Link , useNavigate} from 'react-router-dom'
import { useState } from 'react';
import { Film, Search, Menu, X, Star, CalendarClock } from 'lucide-react'

    const Navbar = () => {
    const[searchQuery,setSearchQuery]=useState('');
    const[isMenuOpen,setIsMenuOpen]=useState(false);
    const navigate=useNavigate();

    const handleSearch=(e: React.FormEvent)=>{
     e.preventDefault();
     if(searchQuery.trim()){
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`)
     }
    };
    const navitems=[
      { label:'Movies', path:"/movies", icon: <Film className="w-5 h-5" /> },
      { label:'Top Rated', path:"/top-rated", icon: <Star className="w-5 h-5" /> },
      { label:'Coming Soon', path:"/comingsoon", icon: <CalendarClock className="w-5 h-5" /> },
    ];


  return (
    <nav className='bg-black/70 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50'>
     <div className='container mx-auto px-4'>
       <div className='flex items-center justify-between h-16'>
          <div className='flex-1 flex items-center'>
            <Link to='./' className='flex items-center gap-2 hover-glow'>
              <Film className='w-7 h-7 text-yellow-500'/>
              <span className='text-lg font-bold text-glow whitespace-nowrap'>MovieDB</span>
            </Link>
          </div>

          
          <div className='hidden md:flex items-center gap-8'>
            <form onSubmit={handleSearch} className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5'/>
              <input type="text"
               value={searchQuery} 
               onChange={(e)=>setSearchQuery(e.target.value)}
                placeholder="Search movies.."
                className='bg-zinc-900/80 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-64 transition-all'
              />
            </form>
            <div className='flex items-center gap-6'>
              { navitems.map((items)=>(
                <Link 
                   key={items.label} 
                   to={items.path}
                   className='text-zinc-300 hover:text-yellow-500 transition-colors hover-glow flex items-center gap-2'
                 >
                  {items.icon}
                  <span>{items.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className='md:hidden'>
            <button className='text-zinc-300 hover:text-white'
            onClick={()=>setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ?<X className='w-6 h-6'/>:<Menu className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className='md:hidden fixed inset-0 bg-black/90 z-50'>
            <div className='flex flex-col h-full'>
             
              <div className='p-4 border-b border-zinc-800'>
                <div className='flex items-center justify-end mb-4'>
                  <button onClick={() => setIsMenuOpen(false)} className='text-zinc-300 hover:text-white'>
                    <X className='w-6 h-6'/>
                  </button>
                </div>
                <form onSubmit={handleSearch} className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5'/>
                  <input 
                    type="text"
                    value={searchQuery} 
                    onChange={(e)=>setSearchQuery(e.target.value)}
                    placeholder="Search movies..."
                    className='w-full bg-zinc-900/80 backdrop-blur-md text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50'
                  />
                </form>
              </div>

             
              <div className='p-4 space-y-1'>
                {navitems.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path}
                    className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
               
                <Link 
                  to="/search"
                  className="flex items-center gap-2 text-zinc-300 hover:text-yellow-500 py-2 px-3 rounded-lg hover:bg-zinc-800/50 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span className="text-sm">Search</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      
      </div> 

      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-zinc-800 z-50">
        <div className="grid grid-cols-4 h-16">
        
          <Link to="/movies" className="flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-yellow-500">
            <Film className="w-6 h-6" />
            <span className="text-xs">Movies</span>
          </Link>

        
          <Link to="/top-rated" className="flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-yellow-500">
            <Star className="w-6 h-6" />
            <span className="text-xs">Top Rated</span>
          </Link>

          <Link to="/comingsoon" className="flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-yellow-500">
            <CalendarClock className="w-6 h-6" />
            <span className="text-xs">Coming Soon</span>
          </Link>

          
          <Link to="/search" className="flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-yellow-500">
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;