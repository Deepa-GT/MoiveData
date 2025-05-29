import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Pages/Home';
import MovieList from './Pages/MovieList';
import MovieDetails from './Pages/MovieDetails';
import ActorDetails from './Pages/ActorDetails';
import ComingSoon from './Pages/ComingSoon';
import Toprated from './Pages/Toprated';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="pt-16 pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/actor/:id" element={<ActorDetails />} />
            <Route path="/top-rated" element={<Toprated />} />
            <Route path="/comingsoon" element={<ComingSoon />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;