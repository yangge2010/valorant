import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-900 py-6 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Valorant Reflex Test. Not affiliated with Riot Games.</p>
      </footer>
    </div>
  );
};

export default Layout;
