import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import { GlobalToaster } from './utils/Toast';
import SuperAdmin from './features/dashboards/SuperAdmin';
import Layout from './components/Layout'; // Import the layout
import PosterList from './features/film poster/PosterList';
import PosterSingle from './features/film poster/PosterSingle';
import PosterCreate from './features/film poster/PosterCreate';
import PosterEdit from './features/film poster/PosterEdit';

import EmployeeList from './features/emlpoyee/EmployeeList';
import EmployeeCreate from './features/emlpoyee/EmployeeCreate';

const App = () => {
  return (
    <BrowserRouter>
    <GlobalToaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<SuperAdmin />} />
          <Route path="/Allposters" element={<PosterList />} />
          <Route path="/poster/:id" element={<PosterSingle />} />
          <Route path="/poster/edit/:id" element={<PosterEdit />} />
          <Route path="/poster/create" element={<PosterCreate />} />

          <Route path="/AllEmployees" element={<EmployeeList />} />
          <Route path="/Employee/create" element={<EmployeeCreate />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;