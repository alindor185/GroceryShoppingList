import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import Login from "./components/Login";
import Register from "./page/Register";
import HomePage from "./components/HomePage";
import WeeklyListDetails from "./components/WeeklyListDetails";
import EditProfile from './components/EditProfile';
import { UserProvider } from './context/UserContext';
import { PublicRoute } from './routes/PublicRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layout/DashboardLayout';
import { Login } from './page/Login'
import { Home } from './page/Home';
import { ViewList } from './page/ViewList';




const App = () => {
  // const token = localStorage.getItem('token'); // Check for the token in localStorage

  // return token ? children : <Navigate to="/login" />; // Redirect to /login if not authenticated

  return (
      <Routes>
        <Route>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        </Route>
        <Route path="/" element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
          {/* <Route index element={<HomePage />} /> */}
          <Route index element={<Home/>} />

          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/weekly-lists/:listId/details" element={<WeeklyListDetails />} />
          <Route path="/list/:listId" element={<ViewList />} />

        </Route>
        <Route path="*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
      </Routes>
  );
};

export default App;
