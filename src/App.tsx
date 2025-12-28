import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import SuperAdmin from './features/dashboards/SuperAdmin';
import Layout from './components/Layout'; // Import the layout
import PosterList from './features/film poster/PosterList';
import PosterSingle from './features/film poster/PosterSingle';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<SuperAdmin />} />
          <Route path="/Allposters" element={<PosterList />} />
          <Route path="/poster/:id" element={<PosterSingle />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;