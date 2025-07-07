import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import { Crown, Users, Clock, Flag, Play, User, Timer, Eye, ArrowLeft, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// const getUserInfo = () => {
//   try {
//     const userInfo = localStorage.getItem('user') || localStorage.getItem('userInfo') || localStorage.getItem('authUser');
//     return userInfo ? JSON.parse(userInfo) : null;
//   } catch (error) {
//     console.error('Error getting user info:', error);
//     return null;
//   }
// };

const getUserInfo = () => {
  try {
    // First try to get userInfo from localStorage (primary source)
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    
    // Fallback to playerName (for backward compatibility)
    const playerName = localStorage.getItem('playerName');
    if (playerName) {
      try {
        const parsed = JSON.parse(playerName);
        return parsed;
      } catch {
        // If parsing fails, it's a plain string
        return { playerName: playerName };
      }
    }
    
    // Fallback to other stored user info
    const authUser = localStorage.getItem('authUser');
    return authUser ? JSON.parse(authUser) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Create socket connection with dynamic user info
const socket = io('http://localhost:5000', {
  auth: {
    user: getUserInfo()
  }
});


socket.on('connect', () => {
  const userInfo = getUserInfo();
  if (userInfo) {
    socket.emit('updateUserInfo', userInfo);
  }
});

function ChessGame({ showGoBack }) {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState('w');
  const [opponentId, setOpponentId] = useState(null);
  const [status, setStatus] = useState('Click "Find Game" to start playing');
  const [gameStarted, setGameStarted] = useState(false);
  const [searchingForGame, setSearchingForGame] = useState(false);
  const [whiteTimer, setWhiteTimer] = useState(600);
  const [blackTimer, setBlackTimer] = useState(600);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [playerName, setPlayerName] = useState('');
const [opponentName, setOpponentName] = useState('');
const [whitePlayerName, setWhitePlayerName] = useState('');
const [blackPlayerName, setBlackPlayerName] = useState('');
  
  // Spectating states
  const [isSpectating, setIsSpectating] = useState(false);
  const [activeGames, setActiveGames] = useState([]);
  const [showActiveGames, setShowActiveGames] = useState(false);
  const [spectatingGameId, setSpectatingGameId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on('waitingForPlayer', () => {
      setStatus('Waiting for opponent to join...');
      setSearchingForGame(true);
      setGameStarted(false);
    });

    socket.on('matchmakingError', ({ message }) => {
      setStatus(`Matchmaking error: ${message}`);
      setSearchingForGame(false);
      setGameStarted(false);
    });

    socket.on('gameFound', ({ gameId, playerColor, opponent, opponentName, playerName }) => {
      setGameId(gameId);
      setPlayerColor(playerColor);
      setOpponentId(opponent);
       setPlayerName(playerName || 'You');
  setOpponentName(opponentName || 'Opponent');
  if (playerColor === 'w') {
    setWhitePlayerName(playerName || 'You');
    setBlackPlayerName(opponentName || 'Opponent');
  } else {
    setWhitePlayerName(opponentName || 'Opponent');
    setBlackPlayerName(playerName || 'You');
  }

      setStatus(`Game started! You are playing as ${playerColor === 'w' ? 'White' : 'Black'}`);
      setGameStarted(true);
      setSearchingForGame(false);
      setIsPlayerTurn(playerColor === 'w');
      setWhiteTimer(600);
      setBlackTimer(600);
      setGame(new Chess());
      setIsSpectating(false);
    });

    socket.on('gameMove', ({ newFen, turn }) => {
      const updatedGame = new Chess(newFen);
      setGame(updatedGame);
      if (!isSpectating) {
        setIsPlayerTurn(turn === playerColor);
      }
    });

    socket.on('invalidMove', () => {
      setStatus('Invalid move! Try again.');
      setTimeout(() => {
        setStatus(`Your turn - You are ${playerColor === 'w' ? 'White' : 'Black'}`);
      }, 2000);
    });

    socket.on('gameEnd', ({ result }) => {
      setStatus(`Game ended: ${result}`);
      setGameStarted(false);
      setSearchingForGame(false);
      setIsPlayerTurn(false);
      if (isSpectating) {
        setIsSpectating(false);
        setSpectatingGameId(null);
      }
    });

    socket.on('timerUpdate', ({ playerTime, opponentTime }) => {
      // This is only for players, not spectators
      if (!isSpectating && gameStarted) {
        if (playerColor === 'w') {
          // Current user is white player
          setWhiteTimer(playerTime);
          setBlackTimer(opponentTime);
        } else {
          // Current user is black player
          setBlackTimer(playerTime);
          setWhiteTimer(opponentTime);
        }
      }
    });

    socket.on('spectatorTimerUpdate', ({ whiteTime, blackTime, currentTurn }) => {
      if (isSpectating) {
        // For spectators, always use absolute values - don't flip based on turn
        setWhiteTimer(whiteTime);
        setBlackTimer(blackTime);
      }
    });

    socket.on('drawOffered', () => {
      setStatus('Opponent offered a draw. Accept or decline?');
    });

    // Spectating events
    socket.on('gameState', (gameState) => {
      if (isSpectating) {
        const spectateGame = new Chess(gameState.fen);
        setGame(spectateGame);
        const timers = JSON.parse(gameState.timers);
        // For initial game state, use absolute values
         const playerNames = JSON.parse(gameState.playerNames || '{}');
    
    // Set spectator names
    setWhitePlayerName(playerNames.white || 'White Player');
    setBlackPlayerName(playerNames.black || 'Black Player');
        setWhiteTimer(timers.white);
        setBlackTimer(timers.black);
        setStatus(`Spectating game - ${gameState.turn === 'w' ? 'White' : 'Black'} to move`);
      }
    });

    socket.on('gameUpdate', (gameState) => {
      if (isSpectating && spectatingGameId === gameState.id) {
        const spectateGame = new Chess(gameState.fen);
        setGame(spectateGame);
        const timers = JSON.parse(gameState.timers);
        // For game updates, use absolute values
        setWhiteTimer(timers.white);
        setBlackTimer(timers.black);
        setStatus(`Spectating game - ${gameState.turn === 'w' ? 'White' : 'Black'} to move`);
      }
    });

    return () => {
      socket.off('waitingForPlayer');
      socket.off('matchmakingError');
      socket.off('gameFound');
      socket.off('gameMove');
      socket.off('invalidMove');
      socket.off('gameEnd');
      socket.off('timerUpdate');
      socket.off('spectatorTimerUpdate'); 
      socket.off('drawOffered');
      socket.off('gameState');
      socket.off('gameUpdate');
    };
  }, [playerColor, isSpectating, spectatingGameId, gameStarted]);

  const fetchActiveGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/games/active');
      const data = await response.json();
      if (data.success) {
        setActiveGames(data.games);
      }
    } catch (error) {
      console.error('Error fetching active games:', error);
    }
  };

  useEffect(() => {
    if (showActiveGames) {
      fetchActiveGames();
      const interval = setInterval(fetchActiveGames, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [showActiveGames]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const makeMove = (move) => {
    if (!isPlayerTurn || !gameStarted || isSpectating) return false;

    const newGame = new Chess(game.fen());
    const result = newGame.move(move);

    if (result) {
      setGame(newGame);
      socket.emit('makeMove', {
        gameId,
        from: move.from,
        to: move.to
      });
      setIsPlayerTurn(false);
      return true;
    }
    return false;
  };

  const findGame = () => {
    // Ensure we have the latest user info before joining matchmaking
    const userInfo = getUserInfo();
    if (!userInfo) {
      setStatus('Please log in to play');
      return;
    }
    
    // Update socket auth and reconnect if needed
    if (socket.auth?.user !== userInfo) {
      socket.auth = { user: userInfo };
      socket.emit('updateUserInfo', userInfo);
    }
    
    setSearchingForGame(true);
    setStatus('Searching for opponent...');
    socket.emit('joinMatchmaking');
  };

  const cancelSearch = () => {
    setSearchingForGame(false);
    setStatus('Search cancelled. Click "Find Game" to start playing');
    socket.emit('cancelMatchmaking');
  };

  const spectateGame = async (gameId) => {
    try {
      setIsSpectating(true);
      setSpectatingGameId(gameId);
      setShowActiveGames(false);
      
      // Join spectator room
      socket.emit('joinSpectator', { gameId });
      
      // Fetch initial game state
      const response = await fetch(`http://localhost:5000/game/${gameId}`);
      const data = await response.json();
      
      if (data.success) {
        const gameState = data.game;
        const spectateGame = new Chess(gameState.fen);
        setGame(spectateGame);
        const timers = JSON.parse(gameState.timers);
        setWhiteTimer(timers.white);
        setBlackTimer(timers.black);
        setStatus(`Spectating game - ${gameState.turn === 'w' ? 'White' : 'Black'} to move`);
        setGameStarted(true);
      }
    } catch (error) {
      console.error('Error joining spectator mode:', error);
      setIsSpectating(false);
      setSpectatingGameId(null);
    }
  };

  const stopSpectating = () => {
    setIsSpectating(false);
    setSpectatingGameId(null);
    setGameStarted(false);
    setStatus('Click "Find Game" to start playing');
    socket.emit('leaveSpectator', { gameId: spectatingGameId });
    setGame(new Chess());
  };

  const offerDraw = () => {
    socket.emit('offerDraw', { gameId });
    setStatus('Draw offer sent to opponent.');
  };

  const acceptDraw = () => {
    socket.emit('acceptDraw', { gameId });
  };

  const declineDraw = () => {
    socket.emit('declineDraw', { gameId });
    setStatus(`Your turn - You are ${playerColor === 'w' ? 'White' : 'Black'}`);
  };

  const resign = () => {
    socket.emit('endGame', { gameId, result: 'resignation' });
  };

  const newGame = () => {
    setGame(new Chess());
    setGameStarted(false);
    setSearchingForGame(false);
    setIsPlayerTurn(false);
    setStatus('Click "Find Game" to start playing');
    setGameId(null);
    setOpponentId(null);
    setIsSpectating(false);
    setSpectatingGameId(null);
     setPlayerName('');
  setOpponentName('');
  setWhitePlayerName('');
  setBlackPlayerName('');
  };

  // Show active games list
  if (showActiveGames && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowActiveGames(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-xl mr-4 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text">
              Active Games
            </h1>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            {activeGames.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">No active games to spectate</p>
                <p className="text-slate-400 text-sm mt-2">Games will appear here when players are online</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeGames.map((game) => (
                  <div
                    key={game.id}
                    className="bg-slate-700/50 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all duration-300 hover:bg-slate-700/70"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                          <span className="text-white font-semibold">Game #{game.id.slice(-6)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                          <div>
                            <span className="text-slate-400">White:</span> {game.playerNames?.white || `Player ${game.players.white.slice(-4)}`}
                          </div>
                          <div>
                            <span className="text-slate-400">Black:</span> {game.playerNames?.black || `Player ${game.players.black.slice(-4)}`}
                          </div>
                          <div>
                            <span className="text-slate-400">Turn:</span> {game.turn === 'w' ? 'White' : 'Black'}
                          </div>
                          <div>
                            <span className="text-slate-400">Moves:</span> {Math.floor(game.moveCount / 2) + 1}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => spectateGame(game.id)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Spectate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted && !searchingForGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-2xl"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <Crown className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Chess Master
            </h1>
            <p className="text-slate-300 text-lg">Ready to play or spectate? Choose your adventure!</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Play className="w-8 h-8 text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-white">Game Options</h2>
            </div>
            <p className="text-slate-300 mb-6">{status}</p>
            <div className="space-y-4">
              <button
                onClick={findGame}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Find Game
              </button>
              <button
                onClick={() => setShowActiveGames(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Spectate Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (searchingForGame && !gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse shadow-2xl"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-blue-400 animate-bounce" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text">
              Chess Master
            </h1>
            <p className="text-slate-300 text-lg">Connecting you with a worthy opponent...</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-400 animate-bounce mr-3" />
              <h2 className="text-2xl font-semibold text-white">Finding Opponent</h2>
            </div>
            <p className="text-slate-300 mb-6">{status}</p>
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <button
              onClick={cancelSearch}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Cancel Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showGoBack && (
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="absolute top-4 left-4 bg-slate-700 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          &larr; Go Back
        </button>
      )}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text">
                Chess Master
              </h1>
              {isSpectating && (
                <div className="ml-4 bg-purple-600/20 border border-purple-500 rounded-full px-4 py-1 flex items-center">
                  <Eye className="w-4 h-4 text-purple-400 mr-2" />
                  <span className="text-purple-300 text-sm font-medium">Spectating</span>
                </div>
              )}
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 inline-block shadow-lg">
              <p className="text-slate-300 flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                {status}
              </p>
            </div>
          </div>

         <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
            {/* Black Player Timer */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl min-w-[280px] order-1 xl:order-1">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-white bg-black rounded-full p-0.5" />
                {blackPlayerName}
                {!isSpectating && playerColor === 'b' && (
                  <span className="ml-2 text-sm text-blue-400">(You)</span>
                )}
              </h3>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Time:</span>
                  <div className={`flex items-center font-mono text-2xl font-bold ${
                    game.turn() === 'b' ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    <Timer className="w-5 h-5 mr-2" />
                    {formatTime(blackTimer)}
                  </div>
                </div>
                {game.turn() === 'b' && (
                  <div className="mt-2 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Chess Board */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-2xl order-3 xl:order-2">
              <div className="w-full max-w-2xl mx-auto">
                  <div>This is the chess board</div>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={(sourceSquare, targetSquare) =>
                    makeMove({ from: sourceSquare, to: targetSquare })
                  }
                  boardOrientation={isSpectating ? 'white' : (playerColor === 'w' ? 'white' : 'black')}
                  customBoardStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#374151' }}
                  customLightSquareStyle={{ backgroundColor: '#f3f4f6' }}
                  arePiecesDraggable={!isSpectating}
                />
              </div>
            </div>

            {/* White Player Timer and Controls */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl min-w-[280px] order-2 xl:order-3">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-black bg-white rounded-full p-0.5" />
                {whitePlayerName}
                {!isSpectating && playerColor === 'w' && (
                  <span className="ml-2 text-sm text-blue-400">(You)</span>
                )}
              </h3>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Time:</span>
                  <div className={`flex items-center font-mono text-2xl font-bold ${
                    game.turn() === 'w' ? 'text-green-400' : 'text-slate-300'
                  }`}>
                    <Timer className="w-5 h-5 mr-2" />
                    {formatTime(whiteTimer)}
                  </div>
                </div>
                {game.turn() === 'w' && (
                  <div className="mt-2 h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 animate-pulse"></div>
                  </div>
                )}
              </div>

              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                {isSpectating ? 'Spectator Controls' : 'Game Controls'}
              </h4>
              <div className="space-y-3">
                {isSpectating ? (
                  <button
                    onClick={stopSpectating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Stop Spectating
                  </button>
                ) : (
                  <>
                    <button
                      onClick={offerDraw}
                      disabled={!gameStarted}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Offer Draw
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptDraw}
                        disabled={!gameStarted}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                      >
                        Accept Draw
                      </button>
                      <button
                        onClick={declineDraw}
                        disabled={!gameStarted}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                      >
                        Decline Draw
                      </button>
                    </div>
                    <button
                      onClick={resign}
                      disabled={!gameStarted}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Resign
                    </button>
                  </>
                )}
                <button
                  onClick={newGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isSpectating ? 'Find New Game' : 'New Game'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3">Game Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Turn:</span>
                    <span className={`font-semibold ${game.turn() === 'w' ? 'text-green-400' : 'text-red-400'}`}>
                      {game.turn() === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{isSpectating ? 'Spectating ID:' : 'Game ID:'}</span>
                    <span className="font-mono text-xs text-slate-400">
                      {(isSpectating ? spectatingGameId : gameId)?.slice(-6) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Moves:</span>
                    <span className="font-semibold text-white">{Math.floor(game.history().length / 2) + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChessGame;

