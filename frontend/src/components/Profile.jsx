import React, { useEffect, useState } from 'react';
import { User, Star, Trophy, Flag, Award, Hash } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setError('Could not load profile');
        }
      } catch (e) {
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center text-slate-300 py-12">Loading profile...</div>;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;
  if (!user) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-0">
      <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-10 w-full min-h-[70vh] border-4 border-purple-600 text-center relative flex flex-col items-center justify-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 mb-4 rounded-full bg-gradient-to-tr from-yellow-400 via-purple-500 to-blue-500 p-1 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">{user.playerName?.[0]?.toUpperCase() || '?'}</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1 flex items-center justify-center">
            <User className="w-7 h-7 mr-2 text-purple-400" />
            {user.playerName}
          </h2>
          <div className="text-slate-400 mb-2 flex items-center justify-center gap-2">
            <Hash className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-xs">{user.playerId}</span>
          </div>
        </div>
        <div className="mb-6 w-full">
          <h3 className="text-xl font-semibold text-purple-300 mb-2 flex items-center justify-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" />My Stats
          </h3>
          <div className="border-b border-slate-700 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 text-left w-full max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-200 font-semibold">Rating:</span>
            </div>
            <span className="text-yellow-300 font-bold text-lg">{user.playerRating}</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-slate-200 font-semibold">Wins:</span>
            </div>
            <span className="text-green-400 font-bold">{user.gamesWon}</span>
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" />
              <span className="text-slate-200 font-semibold">Losses:</span>
            </div>
            <span className="text-red-400 font-bold">{user.gamesLost}</span>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-slate-200 font-semibold">Draws:</span>
            </div>
            <span className="text-yellow-300 font-bold">{user.gamesDrawn}</span>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-300" />
              <span className="text-slate-200 font-semibold">Total Games:</span>
            </div>
            <span className="text-blue-300 font-bold">{user.totalGames}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 