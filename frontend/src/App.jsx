import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ChessAuth from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import Profile from "./components/Profile";
import Leaderboard from "./components/Leaderboard";
import ChessGame from "./components/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ChessAuth />} />
        {/* Dashboard with sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="game" element={<ChessGame showGoBack />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
