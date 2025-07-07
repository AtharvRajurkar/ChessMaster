import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { User, Trophy, Play, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Profile', path: '/dashboard/profile', icon: <User className="w-5 h-5 mr-2" /> },
  { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: <Trophy className="w-5 h-5 mr-2" /> },
  { label: 'New Game', path: '/dashboard/game', icon: <Play className="w-5 h-5 mr-2" /> },
];

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-purple-700 flex flex-col py-8 px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Chess Master</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-700 text-white'
                  : 'text-slate-300 hover:bg-purple-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userInfo');
              window.location.href = '/';
            }}
            className="flex items-center w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-700 hover:text-white font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 