import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
import  {useState} from 'react'
import { Film, Search ,Menu ,X } from 'lucide-react'


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
      { label:'Movies', path:"/movies",},
       { label:'Top Rated', path:"/top-rated", },
       { label:'Coming Soon', path:"/coming soon",},
       ];


  return (
    <nav className='bg-black/70 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50'>
     <div className='container mx-auto px-4'>
       <div className='flex items-center justify-between h-16'>
          <Link to='./' className='flex items-center gap-2 hover-glow'>
           <Film className='w-8 h-8 text-yellow-500'/>
           <span className='text-xl font-bold text-glow'> MovieDB</span>
          </Link>

          
          <div className='hidden md:flex items-center gap-8'>
            <form onSubmit={handleSearch} className='relative'>
              <search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5'/>
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
                   className='text-zinc-300 hover:text-white transition-colors hover-glow'
                 >
                  {items.label}
                  </Link>
                
              ))}
            </div>
          </div>
          <button className='md:hidden text-zinc-300 hover:text-white'
          onClick={()=>setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ?<x className='w-6 h-6'/>:<menu className='w-6 h-6' />}
          </button>
        </div>
          {isMenuOpen &&(
           <div className='md:hidden py-4'>
             <div  className='flex felx-col gap-4'>
            <form  onSubmit={handleSearch} className='relative'>
              <search  className='bg-white absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-600 w-5 h-5'/>
                <input type="text"
                 value={searchQuery} 
                 onChange={(e)=>setSearchQuery(e.target.value)}
                  placeholder="Search movies"
                  className='bg-zinc-900/80 backdrop-blur-md text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 w-full'
                  />
            </form>
            
              { navitems.map((items)=>(
                <Link 
                key={items.label} 
                to={items.path}
                className="text-zinc-300 hover:text-white transition-colors py-2"
                onClick={()=>setIsMenuOpen(false)}
                >
                  {items.label}
                  </Link>
                
              ))}
            
          </div>
           </div>

          )}
      
      </div> 
    </nav>
  );
};

export default Navbar;