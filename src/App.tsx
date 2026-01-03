import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './features/auth/Login';
import { GlobalToaster } from './utils/Toast';
import SuperAdmin from './features/dashboards/SuperAdmin';
import Layout from './components/Layout'; 
import PosterList from './features/film poster/PosterList';
import PosterSingle from './features/film poster/PosterSingle';
import PosterCreate from './features/film poster/PosterCreate';
import PosterEdit from './features/film poster/PosterEdit';
import PosterRearrangeList from './features/film poster/PosterRearrangeList';
import EmployeeList from './features/emlpoyee/EmployeeList';
import EmployeeCreate from './features/emlpoyee/EmployeeCreate';
import AutoLogoutHandler from './components/common/AutoLogoutHandler'; 

import ClientsList from './features/projects/ClientsList';

import UserList from './features/auth/UserList';

const App = () => {
  return (
    <BrowserRouter>
      {/* 2. Add it here so it watches user activity across the entire app */}
      <AutoLogoutHandler />
      
      <GlobalToaster />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/Dashboard" element={<SuperAdmin />} />
          <Route path="/Allposters" element={<PosterList />} />
          <Route path="/Poster/sorting" element={<PosterRearrangeList />} />
          <Route path="/poster/:id" element={<PosterSingle />} />
          <Route path="/poster/edit/:id" element={<PosterEdit />} />
          <Route path="/poster/create" element={<PosterCreate />} />

          <Route path="/AllEmployees" element={<EmployeeList />} />
          <Route path="/Employee/create" element={<EmployeeCreate />} />
          <Route path="/Project/allclients" element={<ClientsList />} />

          <Route path="/AllUsers" element={<UserList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;