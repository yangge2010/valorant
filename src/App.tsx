import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="game" element={<Game />} />
          <Route path="result" element={<Result />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
