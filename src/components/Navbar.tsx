import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crosshair, User, LogOut, BarChart2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors">
          <Crosshair className="w-8 h-8" />
          <span className="font-bold text-xl tracking-wider">VALORANT REFLEX</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/leaderboard" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
            <BarChart2 className="w-5 h-5" />
            <span className="hidden sm:inline">排行榜</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
                登录
              </Link>
              <Link to="/register" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
