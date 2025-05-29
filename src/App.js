import "./App.css";
import Home from "./Pages/Home.tsx";
import Navbar from "./components/Navbar.tsx";
import { BrowserRouter, Routes ,Route} from "react-router-dom";

 import MovieList from "./Pages/MovieList.tsx";
 import MovieDetails from "./Pages/MovieDetails.tsx";
 import Toprated from "./Pages/Toprated.tsx";
import Actordetails from "./Pages/ActorDetails.tsx";
import ComingSoon from "./Pages/ComingSoon.tsx";
function App() {
  return (
   <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Routes>
        
          <Route path="/" element={<Home/>}/>
          <Route path="/movies" element={<MovieList/>}/>
          <Route path="/movie/:id" element={<MovieDetails/>}/>
          <Route path="/actor/:id" element={<Actordetails/>}/>
          <Route path="/top-rated" element={<Toprated/>}/>
       
          <Route path="/comingsoon" element={<ComingSoon />} />
          
          
        </Routes>
        </div>
      </BrowserRouter>
   
  );
}

export default App;