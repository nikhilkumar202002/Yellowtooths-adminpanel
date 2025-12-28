import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import SuperAdmin from './features/dashboards/SuperAdmin';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* This sets Login as the first screen (Front) */}
        <Route path="/" element={<Login />} />
        
        {/* This is the Dashboard screen */}
        <Route path="/dashboard" element={<SuperAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;