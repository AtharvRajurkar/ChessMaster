// import React, { useState, useEffect } from 'react';
// import { Chessboard } from 'react-chessboard';
// import { Chess } from 'chess.js';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// function ChessGame() {
//   const [game, setGame] = useState(new Chess());
//   const [gameId, setGameId] = useState(null);
//   const [playerColor, setPlayerColor] = useState('w');
//   const [opponentId, setOpponentId] = useState(null);
//   const [status, setStatus] = useState('Waiting for opponent...');

//   useEffect(() => {
//     socket.emit('joinMatchmaking');

//     socket.on('waitingForPlayer', () => {
//       setStatus('Waiting for opponent...');
//     });

//     socket.on('gameFound', ({ gameId, playerColor, opponent }) => {
//       setGameId(gameId);
//       setPlayerColor(playerColor);
//       setOpponentId(opponent);
//       setStatus(`Game started! You are ${playerColor === 'w' ? 'White' : 'Black'}.`);
//     });

//     socket.on('gameMove', ({ newFen }) => {
//       const updatedGame = new Chess(newFen);
//       setGame(updatedGame);
//     });

//     socket.on('invalidMove', (data) => {
//       alert('Invalid move!');
//     });

//     socket.on('gameEnd', ({ result }) => {
//       setStatus(`Game ended: ${result}`);
//     });

//     return () => {
//       socket.off('waitingForPlayer');
//       socket.off('gameFound');
//       socket.off('gameMove');
//       socket.off('invalidMove');
//       socket.off('gameEnd');
//     };
//   }, []);

//   const makeMove = (move) => {
//     const newGame = new Chess(game.fen());
//     const result = newGame.move(move);

//     if (result) {
//       setGame(newGame);
//       socket.emit('makeMove', {
//         gameId,
//         from: move.from,
//         to: move.to
//       });
//     }
//   };

//   const offerDraw = () => {
//     socket.emit('offerDraw', { gameId });
//     setStatus('Draw offer sent.');
//   };

//   const acceptDraw = () => {
//     socket.emit('acceptDraw', { gameId });
//   };

//   const resign = () => {
//     socket.emit('endGame', { gameId, result: 'resignation' });
//   };

//   const newGame = () => {
//     setGame(new Chess());
//     socket.emit('joinMatchmaking');
//     setStatus('Searching for new game...');
//   };

//   return (
//     <div>
//       <h2>{status}</h2>
//       <div className='w-2xl'>
//       <Chessboard
//         position={game.fen()}
//         onPieceDrop={(sourceSquare, targetSquare) =>
//           makeMove({ from: sourceSquare, to: targetSquare })
//         }
//         boardOrientation={playerColor === 'w' ? 'white' : 'black'}
//       />
//       </div>
//       <div style={{ marginTop: '10px' }}>
//         <button onClick={offerDraw}>Offer Draw</button>
//         <button onClick={acceptDraw}>Accept Draw</button>
//         <button onClick={resign}>Resign</button>
//         <button onClick={newGame}>New Game</button>
//       </div>
//     </div>
//   );
// }

// export default ChessGame;












// import React, { useState, useEffect } from 'react';
// import { Chessboard } from 'react-chessboard';
// import { Chess } from 'chess.js';
// import io from 'socket.io-client';
// import { Crown, Users, Clock, Flag } from 'lucide-react';

// const socket = io('http://localhost:5000');

// function ChessGame() {
//   const [game, setGame] = useState(new Chess());
//   const [gameId, setGameId] = useState(null);
//   const [playerColor, setPlayerColor] = useState('w');
//   const [opponentId, setOpponentId] = useState(null);
//   const [status, setStatus] = useState('Waiting for opponent...');
//   const [gameStarted, setGameStarted] = useState(false);
//   const [searchingForGame, setSearchingForGame] = useState(true);

//   useEffect(() => {
//     socket.emit('joinMatchmaking');

//     socket.on('waitingForPlayer', () => {
//       setStatus('Waiting for opponent...');
//       setSearchingForGame(true);
//       setGameStarted(false);
//     });

//     socket.on('gameFound', ({ gameId, playerColor, opponent }) => {
//       setGameId(gameId);
//       setPlayerColor(playerColor);
//       setOpponentId(opponent);
//       setStatus(`Game started! You are ${playerColor === 'w' ? 'White' : 'Black'}.`);
//       setGameStarted(true);
//       setSearchingForGame(false);
//     });

//     socket.on('gameMove', ({ newFen }) => {
//       const updatedGame = new Chess(newFen);
//       setGame(updatedGame);
//     });

//     socket.on('invalidMove', (data) => {
//       alert('Invalid move!');
//     });

//     socket.on('gameEnd', ({ result }) => {
//       setStatus(`Game ended: ${result}`);
//       setGameStarted(false);
//     });

//     return () => {
//       socket.off('waitingForPlayer');
//       socket.off('gameFound');
//       socket.off('gameMove');
//       socket.off('invalidMove');
//       socket.off('gameEnd');
//     };
//   }, []);

//   const makeMove = (move) => {
//     const newGame = new Chess(game.fen());
//     const result = newGame.move(move);

//     if (result) {
//       setGame(newGame);
//       socket.emit('makeMove', {
//         gameId,
//         from: move.from,
//         to: move.to
//       });
//     }
//   };

//   const offerDraw = () => {
//     socket.emit('offerDraw', { gameId });
//     setStatus('Draw offer sent.');
//   };

//   const acceptDraw = () => {
//     socket.emit('acceptDraw', { gameId });
//   };

//   const resign = () => {
//     socket.emit('endGame', { gameId, result: 'resignation' });
//   };

//   const newGame = () => {
//     setGame(new Chess());
//     setGameStarted(false);
//     setSearchingForGame(true);
//     socket.emit('joinMatchmaking');
//     setStatus('Searching for new game...');
//   };

//   if (!gameStarted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
//         <div className="text-center max-w-md mx-auto">
//           <div className="mb-8 relative">
//             <div className="w-32 h-32 mx-auto mb-6 relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full animate-pulse"></div>
//               <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
//                 <Crown className="w-12 h-12 text-yellow-400" />
//               </div>
//             </div>
//             <h1 className="text-4xl font-bold text-white mb-2">Chess Master</h1>
//             <p className="text-slate-300 text-lg">Welcome to the ultimate chess experience</p>
//           </div>

//           {searchingForGame ? (
//             <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
//               <div className="flex items-center justify-center mb-4">
//                 <Users className="w-8 h-8 text-blue-400 animate-bounce mr-3" />
//                 <h2 className="text-2xl font-semibold text-white">Finding Opponent</h2>
//               </div>
//               <p className="text-slate-300 mb-6">{status}</p>
//               <div className="flex justify-center mb-6">
//                 <div className="flex space-x-2">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
//                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                 </div>
//               </div>
//               <button
//                 onClick={newGame}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Search New Game
//               </button>
//             </div>
//           ) : (
//             <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
//               <h2 className="text-2xl font-semibold text-white mb-4">Game Ended</h2>
//               <p className="text-slate-300 mb-6">{status}</p>
//               <button
//                 onClick={newGame}
//                 className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Play Again
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-6">
//           <h1 className="text-3xl font-bold text-white mb-2">Chess Master</h1>
//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 inline-block">
//             <p className="text-slate-300 flex items-center justify-center">
//               <Crown className="w-5 h-5 mr-2 text-yellow-400" />
//               {status}
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
//           <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
//             <div className="w-full max-w-2xl mx-auto">
//               <Chessboard
//                 position={game.fen()}
//                 onPieceDrop={(sourceSquare, targetSquare) =>
//                   makeMove({ from: sourceSquare, to: targetSquare })
//                 }
//                 boardOrientation={playerColor === 'w' ? 'white' : 'black'}
//                 customBoardStyle={{
//                   borderRadius: '12px',
//                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
//                 }}
//               />
//             </div>
//           </div>

//           <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 min-w-[280px]">
//             <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
//               <Clock className="w-5 h-5 mr-2 text-blue-400" />
//               Game Controls
//             </h3>
//             <div className="space-y-3">
//               <button
//                 onClick={offerDraw}
//                 className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Offer Draw
//               </button>
//               <button
//                 onClick={acceptDraw}
//                 className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 Accept Draw
//               </button>
//               <button
//                 onClick={resign}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
//               >
//                 <Flag className="w-4 h-4 mr-2" />
//                 Resign
//               </button>
//               <button
//                 onClick={newGame}
//                 className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
//               >
//                 New Game
//               </button>
//             </div>

//             <div className="mt-6 pt-6 border-t border-slate-600">
//               <h4 className="text-lg font-semibold text-white mb-3">Game Info</h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between text-slate-300">
//                   <span>Your Color:</span>
//                   <span className="font-semibold text-white">{playerColor === 'w' ? 'White' : 'Black'}</span>
//                 </div>
//                 <div className="flex justify-between text-slate-300">
//                   <span>Game ID:</span>
//                   <span className="font-mono text-xs text-slate-400">{gameId || 'N/A'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChessGame;


































import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import { Crown, Users, Clock, Flag, Play, User, Timer } from 'lucide-react';

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

// Reconnect with updated user info if needed
socket.on('connect', () => {
  const userInfo = getUserInfo();
  if (userInfo) {
    socket.emit('updateUserInfo', userInfo);
  }
});

function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState('w');
  const [opponentId, setOpponentId] = useState(null);
  const [status, setStatus] = useState('Click "Find Game" to start playing');
  const [gameStarted, setGameStarted] = useState(false);
  const [searchingForGame, setSearchingForGame] = useState(false);
  const [playerTimer, setPlayerTimer] = useState(600); // 10 minutes
  const [opponentTimer, setOpponentTimer] = useState(600);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);

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

    socket.on('gameFound', ({ gameId, playerColor, opponent }) => {
      setGameId(gameId);
      setPlayerColor(playerColor);
      setOpponentId(opponent);
      setStatus(`Game started! You are playing as ${playerColor === 'w' ? 'White' : 'Black'}`);
      setGameStarted(true);
      setSearchingForGame(false);
      setIsPlayerTurn(playerColor === 'w');
      setPlayerTimer(600);
      setOpponentTimer(600);
      setGame(new Chess()); // Reset to starting position
    });

    socket.on('gameMove', ({ newFen, turn }) => {
      const updatedGame = new Chess(newFen);
      setGame(updatedGame);
      setIsPlayerTurn(turn === playerColor);
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
    });

    socket.on('timerUpdate', ({ playerTime, opponentTime }) => {
      setPlayerTimer(playerTime);
      setOpponentTimer(opponentTime);
    });

    socket.on('drawOffered', () => {
      setStatus('Opponent offered a draw. Accept or decline?');
    });

    return () => {
      socket.off('waitingForPlayer');
      socket.off('matchmakingError');
      socket.off('gameFound');
      socket.off('gameMove');
      socket.off('invalidMove');
      socket.off('gameEnd');
      socket.off('timerUpdate');
      socket.off('drawOffered');
    };
  }, [playerColor]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const makeMove = (move) => {
    if (!isPlayerTurn || !gameStarted) return false;

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
  };

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
            <p className="text-slate-300 text-lg">Ready to play? Find an opponent and start your game!</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Play className="w-8 h-8 text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-white">Ready to Play</h2>
            </div>
            <p className="text-slate-300 mb-6">{status}</p>
            <button
              onClick={findGame}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
            >
              <Users className="w-5 h-5 mr-2" />
              Find Game
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text">
            Chess Master
          </h1>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 inline-block shadow-lg">
            <p className="text-slate-300 flex items-center justify-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-400" />
              {status}
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start justify-center">
          {/* Timer and Opponent Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl min-w-[280px] order-1 xl:order-1">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-slate-400" />
              Opponent ({playerColor === 'w' ? 'Black' : 'White'})
            </h3>
            <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Time:</span>
                <div className={`flex items-center font-mono text-2xl font-bold ${!isPlayerTurn ? 'text-red-400' : 'text-slate-300'}`}>
                  <Timer className="w-5 h-5 mr-2" />
                  {formatTime(opponentTimer)}
                </div>
              </div>
              {!isPlayerTurn && (
                <div className="mt-2 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Chess Board */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-2xl order-3 xl:order-2">
            <div className="w-full max-w-2xl mx-auto">
              <div>This is the Chessboard</div>
              <Chessboard
                position={game.fen()}
                onPieceDrop={(sourceSquare, targetSquare) =>
                  makeMove({ from: sourceSquare, to: targetSquare })
                }
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                customBoardStyle={{
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                }}
                customDarkSquareStyle={{ backgroundColor: '#374151' }}
                customLightSquareStyle={{ backgroundColor: '#f3f4f6' }}
              />
            </div>
          </div>

          {/* Player Info and Controls */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl min-w-[280px] order-2 xl:order-3">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              You ({playerColor === 'w' ? 'White' : 'Black'})
            </h3>
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Time:</span>
                <div className={`flex items-center font-mono text-2xl font-bold ${isPlayerTurn ? 'text-green-400' : 'text-slate-300'}`}>
                  <Timer className="w-5 h-5 mr-2" />
                  {formatTime(playerTimer)}
                </div>
              </div>
              {isPlayerTurn && (
                <div className="mt-2 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 animate-pulse"></div>
                </div>
              )}
            </div>

            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              Game Controls
            </h4>
            <div className="space-y-3">
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
              <button
                onClick={newGame}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                New Game
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-3">Game Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Turn:</span>
                  <span className={`font-semibold ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
                    {isPlayerTurn ? 'Your Turn' : 'Opponent\'s Turn'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Game ID:</span>
                  <span className="font-mono text-xs text-slate-400">{gameId || 'N/A'}</span>
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
  );
}

export default ChessGame;