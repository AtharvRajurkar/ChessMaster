import React, { useEffect, useState } from 'react';
import { User, Star, Trophy, Flag, Award, Hash } from 'lucide-react';

const medalColors = [
  'from-yellow-400 to-yellow-600', // Gold
  'from-slate-300 to-slate-500',   // Silver
  'from-orange-400 to-orange-700'  // Bronze
];

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/leaderboard');
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError('Could not load leaderboard');
        }
      } catch (e) {
        setError('Error loading leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center text-slate-300 py-12">Loading leaderboard...</div>;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;

  return (
    <div className="w-full max-w-5xl mx-auto my-8 p-0">
      <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-10 w-full min-h-[70vh] border-4 border-purple-600">
        <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
          <Trophy className="w-7 h-7 mr-2 text-yellow-400" />Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-slate-200 text-base">
            <thead>
              <tr className="bg-slate-700/80">
                <th className="py-3 px-4 text-left font-semibold"><Hash className="inline w-4 h-4 mr-1 text-purple-300" />#</th>
                <th className="py-3 px-4 text-left font-semibold"><User className="inline w-4 h-4 mr-1 text-blue-300" />Player</th>
                <th className="py-3 px-4 text-left font-semibold"><Star className="inline w-4 h-4 mr-1 text-yellow-400" />Rating</th>
                <th className="py-3 px-4 text-left font-semibold"><Trophy className="inline w-4 h-4 mr-1 text-green-400" />Wins</th>
                <th className="py-3 px-4 text-left font-semibold"><Flag className="inline w-4 h-4 mr-1 text-red-400" />Losses</th>
                <th className="py-3 px-4 text-left font-semibold"><Award className="inline w-4 h-4 mr-1 text-yellow-300" />Draws</th>
                <th className="py-3 px-4 text-left font-semibold"><User className="inline w-4 h-4 mr-1 text-blue-300" />Total</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.playerId}
                  className={`transition-colors ${
                    idx < 3
                      ? `bg-gradient-to-r ${medalColors[idx]} text-white`
                      : 'hover:bg-slate-700/60'
                  }`}
                >
                  <td className="py-2 px-4 font-bold text-lg">{idx + 1}</td>
                  <td className="py-2 px-4 font-semibold flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                      idx < 3
                        ? `bg-gradient-to-tr ${medalColors[idx]}`
                        : 'bg-slate-700'
                    }`}>
                      {user.playerName?.[0]?.toUpperCase() || '?'}
                    </span>
                    {user.playerName}
                  </td>
                  <td className="py-2 px-4 text-yellow-300 font-bold">{user.playerRating}</td>
                  <td className="py-2 px-4 text-green-400 font-bold">{user.gamesWon}</td>
                  <td className="py-2 px-4 text-red-400 font-bold">{user.gamesLost}</td>
                  <td className="py-2 px-4 text-yellow-300 font-bold">{user.gamesDrawn}</td>
                  <td className="py-2 px-4 text-blue-300 font-bold">{user.totalGames}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 