import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import SuperAdmin from './features/dashboards/SuperAdmin';
import Layout from './components/Layout'; // Import the layout

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<SuperAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;