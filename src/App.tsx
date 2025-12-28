import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import SuperAdmin from './features/dashboards/SuperAdmin';
import Layout from './components/Layout'; // Import the layout
import PosterList from './features/film poster/PosterList';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<SuperAdmin />} />
          <Route path="/Allposters" element={<PosterList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;