// import React, { useState, useContext, createContext } from 'react';
// import { Eye, EyeOff, User, Mail, Lock, Crown } from 'lucide-react';

// // Auth Context
// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [loading, setLoading] = useState(false);

//   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

//   const login = async (email, password) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         setToken(data.token);
//         setUser(data.user);
//         localStorage.setItem('token', data.token);
//         return { success: true };
//       } else {
//         return { success: false, error: data.error };
//       }
//     } catch (error) {
//       return { success: false, error: 'Network error' };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (playerName, email, password) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ playerName, email, password })
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         setToken(data.token);
//         setUser(data.user);
//         localStorage.setItem('token', data.token);
//         return { success: true };
//       } else {
//         return { success: false, error: data.error };
//       }
//     } catch (error) {
//       return { success: false, error: 'Network error' };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };

// // Login/Signup Component
// const AuthForm = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     playerName: '',
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState('');

//   const { login, register, loading } = useAuth();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e?.preventDefault();
//     setError('');

//     if (isLogin) {
//       const result = await login(formData.email, formData.password);
//       if (!result.success) {
//         setError(result.error);
//       }
//     } else {
//       if (!formData.playerName || !formData.email || !formData.password) {
//         setError('All fields are required');
//         return;
//       }
      
//       const result = await register(formData.playerName, formData.email, formData.password);
//       if (!result.success) {
//         setError(result.error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//       <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <Crown className="w-12 h-12 text-yellow-400" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Chess Master</h1>
//           <p className="text-gray-300">
//             {isLogin ? 'Welcome back, champion!' : 'Join the battle of minds'}
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
//             <p className="text-red-200 text-sm">{error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <div className="space-y-6">
//           {/* Player Name (Signup only) */}
//           {!isLogin && (
//             <div className="relative">
//               <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 name="playerName"
//                 placeholder="Player Name"
//                 value={formData.playerName}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 required={!isLogin}
//               />
//             </div>
//           )}

//           {/* Email */}
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
//             >
//               {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//             </button>
//           </div>

//           {/* Submit Button */}
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
//           >
//             {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
//           </button>
//         </div>

//         {/* Toggle Form */}
//         <div className="text-center mt-6">
//           <p className="text-gray-300">
//             {isLogin ? "Don't have an account? " : "Already have an account? "}
//             <button
//               onClick={() => {
//                 setIsLogin(!isLogin);
//                 setError('');
//                 setFormData({ playerName: '', email: '', password: '' });
//               }}
//               className="text-purple-400 hover:text-purple-300 font-semibold"
//             >
//               {isLogin ? 'Sign Up' : 'Sign In'}
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // User Dashboard (after login)
// const UserDashboard = () => {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <Crown className="w-8 h-8 text-yellow-400" />
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Welcome, {user.playerName}!</h1>
//                 <p className="text-gray-300">Rating: {user.playerRating}</p>
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
//             >
//               Logout
//             </button>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//             <h3 className="text-green-400 text-lg font-semibold">Games Won</h3>
//             <p className="text-3xl font-bold text-white">{user.gamesWon}</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//             <h3 className="text-red-400 text-lg font-semibold">Games Lost</h3>
//             <p className="text-3xl font-bold text-white">{user.gamesLost}</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//             <h3 className="text-yellow-400 text-lg font-semibold">Draws</h3>
//             <p className="text-3xl font-bold text-white">{user.gamesDrawn}</p>
//           </div>
//           <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
//             <h3 className="text-blue-400 text-lg font-semibold">Win Rate</h3>
//             <p className="text-3xl font-bold text-white">{user.winRate?.toFixed(1)}%</p>
//           </div>
//         </div>

//         {/* Game Actions */}
//         <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
//           <h2 className="text-xl font-bold text-white mb-4">Ready to Play?</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
//               Quick Match
//             </button>
//             <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
//               Create Game
//             </button>
//             <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
//               Join Game
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const { user } = useAuth();

//   return user ? <UserDashboard /> : <AuthForm />;
// };

// // Export wrapped with AuthProvider
// export default function ChessAuth() {
//   return (
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   );
// }

import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Crown } from 'lucide-react';

// Login/Signup Component
const AuthForm = ({ onLogin, loading, error, setError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    playerName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (isLogin) {
      await onLogin(formData.email, formData.password, 'login');
    } else {
      if (!formData.playerName || !formData.email || !formData.password) {
        setError('All fields are required');
        return;
      }
      
      await onLogin(formData.playerName, formData.email, formData.password, 'register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Chess Master</h1>
          <p className="text-gray-300">
            {isLogin ? 'Welcome back, champion!' : 'Join the battle of minds'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Player Name (Signup only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="playerName"
                placeholder="Player Name"
                value={formData.playerName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Toggle Form */}
        <div className="text-center mt-6">
          <p className="text-gray-300">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ playerName: '', email: '', password: '' });
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// User Dashboard (after login)
const UserDashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome, {user.playerName}!</h1>
                <p className="text-gray-300">Rating: {user.playerRating}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-green-400 text-lg font-semibold">Games Won</h3>
            <p className="text-3xl font-bold text-white">{user.gamesWon}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-red-400 text-lg font-semibold">Games Lost</h3>
            <p className="text-3xl font-bold text-white">{user.gamesLost}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-yellow-400 text-lg font-semibold">Draws</h3>
            <p className="text-3xl font-bold text-white">{user.gamesDrawn}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-blue-400 text-lg font-semibold">Win Rate</h3>
            <p className="text-3xl font-bold text-white">{user.winRate?.toFixed(1)}%</p>
          </div>
        </div>

        {/* Game Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Ready to Play?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
              Quick Match
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
              Create Game
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function ChessAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  const handleAuth = async (emailOrName, emailOrPassword, passwordOrType, type) => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (type === 'login') {
        response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailOrName, password: emailOrPassword })
        });
      } else {
        response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            playerName: emailOrName, 
            email: emailOrPassword, 
            password: passwordOrType 
          })
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setError('');
  };

  return (
    <>
      {user ? (
        <UserDashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm 
          onLogin={handleAuth} 
          loading={loading} 
          error={error} 
          setError={setError} 
        />
      )}
    </>
  );
}