const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
dotenv.config();

const port = process.env.PORT || 5000;

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
const redisPub = redis.createClient({ url: process.env.REDIS_URL });
const redisSub = redis.createClient({ url: process.env.REDIS_URL });

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisPub.on('error', (err) => console.log('Redis Pub Error', err));
redisSub.on('error', (err) => console.log('Redis Sub Error', err));

redisClient.connect();
redisPub.connect();
redisSub.connect();

// In-memory storage for quick access (Redis will be primary storage)
let waitingPlayer = null; // Only store one waiting player
let games = new Map();
let playerTimers = new Map();

function generateGameId() {
  return Math.random().toString(36).slice(2, 11).padEnd(9, '0');
}

// Game state management
class GameState {
  constructor(gameId, whitePlayer, blackPlayer) {
    this.id = gameId;
    this.players = {
      white: whitePlayer.id,
      black: blackPlayer.id
    };
    this.sockets = {
      white: whitePlayer.socket,
      black: blackPlayer.socket
    };
    this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    this.turn = "w";
    this.status = "active";
    this.moveHistory = [];
    this.startTime = Date.now();
    this.lastMoveTime = Date.now();
    this.timers = {
      white: 600, // 10 minutes in seconds
      black: 600
    };
    this.currentTurnStartTime = Date.now();
    this.drawOffers = {
      white: false,
      black: false
    };
  }

  toRedisObject() {
    return {
      id: this.id,
      players: JSON.stringify(this.players),
      fen: this.fen,
      turn: this.turn,
      status: this.status,
      moveHistory: JSON.stringify(this.moveHistory),
      startTime: this.startTime,
      lastMoveTime: this.lastMoveTime,
      timers: JSON.stringify(this.timers),
      currentTurnStartTime: this.currentTurnStartTime,
      drawOffers: JSON.stringify(this.drawOffers)
    };
  }

  static fromRedisObject(obj, sockets = {}) {
    const game = new GameState(
      { id: 'temp', socket: null },
      { id: 'temp', socket: null }
    );
    
    game.id = obj.id;
    game.players = JSON.parse(obj.players);
    game.sockets = sockets;
    game.fen = obj.fen;
    game.turn = obj.turn;
    game.status = obj.status;
    game.moveHistory = JSON.parse(obj.moveHistory);
    game.startTime = parseInt(obj.startTime);
    game.lastMoveTime = parseInt(obj.lastMoveTime);
    game.timers = JSON.parse(obj.timers);
    game.currentTurnStartTime = parseInt(obj.currentTurnStartTime);
    game.drawOffers = JSON.parse(obj.drawOffers);
    
    return game;
  }

  async saveToRedis() {
    try {
      await redisClient.hSet(`game:${this.id}`, this.toRedisObject());
      await redisClient.expire(`game:${this.id}`, 3600); // Expire after 1 hour
      
      // Publish game state update for spectators
      await redisPub.publish('gameUpdate', JSON.stringify({
        gameId: this.id,
        state: this.toRedisObject()
      }));
    } catch (error) {
      console.error('Error saving game to Redis:', error);
    }
  }

  updateTimer() {
    const now = Date.now();
    const elapsed = Math.floor((now - this.currentTurnStartTime) / 1000);
    
    if (this.turn === 'w') {
      this.timers.white = Math.max(0, this.timers.white - elapsed);
    } else {
      this.timers.black = Math.max(0, this.timers.black - elapsed);
    }
    
    this.currentTurnStartTime = now;
    
    // Check for time out
    if (this.timers.white <= 0 || this.timers.black <= 0) {
      const winner = this.timers.white <= 0 ? 'black' : 'white';
      this.status = 'ended';
      return `${winner} wins by timeout`;
    }
    
    return null;
  }
}

// Timer management
function startGameTimer(gameId) {
  const timer = setInterval(async () => {
    const game = games.get(gameId);
    if (!game || game.status !== 'active') {
      clearInterval(timer);
      playerTimers.delete(gameId);
      return;
    }

    const timeoutResult = game.updateTimer();
    
    if (timeoutResult) {
      // Game ended by timeout
      clearInterval(timer);
      playerTimers.delete(gameId);
      
      io.to(gameId).emit('gameEnd', { result: timeoutResult });
      // Also notify spectators
      io.to(`spectate:${gameId}`).emit('gameEnd', { result: timeoutResult });
      
      games.delete(gameId);
      await redisClient.del(`game:${gameId}`);
      return;
    }

    // Send timer updates to players and spectators
    const timerData = {
      playerTime: game.turn === 'w' ? game.timers.white : game.timers.black,
      opponentTime: game.turn === 'w' ? game.timers.black : game.timers.white
    };
    
    io.to(gameId).emit('timerUpdate', timerData);
    io.to(`spectate:${gameId}`).emit('timerUpdate', timerData);

    // Save updated game state
    await game.saveToRedis();
  }, 1000);

  playerTimers.set(gameId, timer);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinMatchmaking', () => {
    if (waitingPlayer && waitingPlayer.id !== socket.id) {
      // Match found!
      const gameId = generateGameId();
      const whitePlayer = waitingPlayer;
      const blackPlayer = { id: socket.id, socket: socket };

      // Create new game
      const game = new GameState(gameId, whitePlayer, blackPlayer);
      games.set(gameId, game);

      // Join rooms
      whitePlayer.socket.join(gameId);
      blackPlayer.socket.join(gameId);

      // Save to Redis
      game.saveToRedis();

      // Notify players
      whitePlayer.socket.emit('gameFound', {
        gameId: gameId,
        playerColor: 'w',
        opponent: blackPlayer.id
      });

      blackPlayer.socket.emit('gameFound', {
        gameId: gameId,
        playerColor: 'b',
        opponent: whitePlayer.id
      });

      // Start timer
      startGameTimer(gameId);

      // Clear waiting player
      waitingPlayer = null;

    } else {
      // No one waiting or same player, add to queue
      waitingPlayer = {
        id: socket.id,
        socket: socket,
        joinTime: Date.now()
      };
      socket.emit('waitingForPlayer');
    }
  });

  socket.on('cancelMatchmaking', () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });

  // Handle spectator joining
  socket.on('joinSpectator', async (data) => {
    try {
      const { gameId } = data;
      socket.join(`spectate:${gameId}`);
      
      // Send current game state
      const game = games.get(gameId);
      if (game) {
        socket.emit('gameState', game.toRedisObject());
      } else {
        // Check Redis
        const gameData = await redisClient.hGetAll(`game:${gameId}`);
        if (Object.keys(gameData).length > 0) {
          socket.emit('gameState', gameData);
        }
      }
    } catch (error) {
      console.error('Error handling spectator join:', error);
    }
  });

  socket.on('leaveSpectator', (data) => {
    const { gameId } = data;
    socket.leave(`spectate:${gameId}`);
  });

  socket.on('makeMove', async (data) => {
    try {
      const { gameId, from, to } = data;
      const game = games.get(gameId);

      if (game && game.status === 'active') {
        const isWhitePlayer = game.players.white === socket.id;
        const isBlackPlayer = game.players.black === socket.id;
        const canMove = (game.turn === 'w' && isWhitePlayer) ||
                        (game.turn === 'b' && isBlackPlayer);

        if (canMove) {
          // Update timer before processing move
          const timeoutResult = game.updateTimer();
          if (timeoutResult) {
            io.to(gameId).emit('gameEnd', { result: timeoutResult });
            io.to(`spectate:${gameId}`).emit('gameEnd', { result: timeoutResult });
            games.delete(gameId);
            await redisClient.del(`game:${gameId}`);
            return;
          }

          const chess = new Chess(game.fen);
          const moveResult = chess.move({ from, to });

          if (moveResult) {
            // Valid move - update game state
            game.turn = chess.turn();
            game.fen = chess.fen();
            game.moveHistory.push({
              from,
              to,
              san: moveResult.san,
              timestamp: Date.now()
            });
            game.lastMoveTime = Date.now();
            game.currentTurnStartTime = Date.now(); // Reset timer for next turn

            // Check for game end conditions
            if (chess.isGameOver()) {
              let result = '';
              if (chess.isCheckmate()) {
                result = `${game.turn === 'w' ? 'Black' : 'White'} wins by checkmate`;
              } else if (chess.isDraw()) {
                if (chess.isStalemate()) {
                  result = 'Draw by stalemate';
                } else if (chess.isThreefoldRepetition()) {
                  result = 'Draw by threefold repetition';
                } else if (chess.isInsufficientMaterial()) {
                  result = 'Draw by insufficient material';
                } else {
                  result = 'Draw by 50-move rule';
                }
              }
              
              game.status = 'ended';
              await game.saveToRedis();
              
              io.to(gameId).emit('gameEnd', { result });
              io.to(`spectate:${gameId}`).emit('gameEnd', { result });
              
              // Cleanup
              const timer = playerTimers.get(gameId);
              if (timer) {
                clearInterval(timer);
                playerTimers.delete(gameId);
              }
              games.delete(gameId);
              
            } else {
              // Game continues
              await game.saveToRedis();
              
              const moveData = {
                from,
                to,
                newFen: game.fen,
                turn: game.turn,
                move: moveResult.san,
                moveHistory: game.moveHistory
              };
              
              // Send to players and spectators
              io.to(gameId).emit('gameMove', moveData);
              io.to(`spectate:${gameId}`).emit('gameMove', moveData);
            }
          } else {
            // Invalid move
            socket.emit('invalidMove', {
              reason: 'Illegal move'
            });
          }
        } else {
          socket.emit('invalidMove', {
            reason: 'Not your turn'
          });
        }
      }
    } catch (error) {
      console.error('Error handling move:', error);
      socket.emit('serverError', {
        message: 'Internal server error'
      });
    }
  });

  socket.on('offerDraw', async (data) => {
    try {
      const { gameId } = data;
      const game = games.get(gameId);

      if (game && game.status === 'active') {
        const isWhitePlayer = game.players.white === socket.id;
        const playerColor = isWhitePlayer ? 'white' : 'black';
        
        game.drawOffers[playerColor] = true;
        await game.saveToRedis();

        // Notify opponent
        const opponentSocket = isWhitePlayer ? game.sockets.black : game.sockets.white;
        if (opponentSocket) {
          opponentSocket.emit('drawOffered');
        }
      }
    } catch (error) {
      console.error('Error handling draw offer:', error);
    }
  });

  socket.on('acceptDraw', async (data) => {
    try {
      const { gameId } = data;
      const game = games.get(gameId);

      if (game && game.status === 'active') {
        game.status = 'ended';
        await game.saveToRedis();

        io.to(gameId).emit('gameEnd', { result: 'Draw by agreement' });
        io.to(`spectate:${gameId}`).emit('gameEnd', { result: 'Draw by agreement' });
        
        // Cleanup
        const timer = playerTimers.get(gameId);
        if (timer) {
          clearInterval(timer);
          playerTimers.delete(gameId);
        }
        games.delete(gameId);
      }
    } catch (error) {
      console.error('Error handling draw accept:', error);
    }
  });

  socket.on('declineDraw', async (data) => {
    try {
      const { gameId } = data;
      const game = games.get(gameId);

      if (game && game.status === 'active') {
        // Reset draw offers
        game.drawOffers.white = false;
        game.drawOffers.black = false;
        await game.saveToRedis();

        // Notify both players
        io.to(gameId).emit('drawDeclined');
      }
    } catch (error) {
      console.error('Error handling draw decline:', error);
    }
  });

  socket.on('endGame', async (data) => {
    try {
      const { gameId, result } = data;
      const game = games.get(gameId);

      if (game) {
        const isWhitePlayer = game.players.white === socket.id;
        const winnerColor = isWhitePlayer ? 'Black' : 'White';
        
        game.status = 'ended';
        await game.saveToRedis();

        const endResult = result === 'resignation' ? `${winnerColor} wins by resignation` : result;

        io.to(gameId).emit('gameEnd', { result: endResult });
        io.to(`spectate:${gameId}`).emit('gameEnd', { result: endResult });
        
        // Cleanup
        const timer = playerTimers.get(gameId);
        if (timer) {
          clearInterval(timer);
          playerTimers.delete(gameId);
        }
        games.delete(gameId);
      }
    } catch (error) {
      console.error('Error handling game end:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    // Remove from waiting queue if present
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    // Check active games
    for (let [gameId, game] of games) {
      if (game.players.white === socket.id || game.players.black === socket.id) {
        const opponentId = game.players.white === socket.id ?
                           game.players.black : game.players.white;
        const opponentSocket = game.players.white === socket.id ?
                              game.sockets.black : game.sockets.white;

        game.status = 'ended';
        await game.saveToRedis();

        if (opponentSocket) {
          opponentSocket.emit('gameEnd', { result: 'Opponent disconnected' });
        }
        
        // Notify spectators
        io.to(`spectate:${gameId}`).emit('gameEnd', { result: 'Opponent disconnected' });
        
        // Cleanup
        const timer = playerTimers.get(gameId);
        if (timer) {
          clearInterval(timer);
          playerTimers.delete(gameId);
        }
        games.delete(gameId);
      }
    }
  });
});

// REST API endpoints
app.post("/validate-move", (req, res) => {
  try {
    const { from, to, fen } = req.body;

    if (!from || !to || !fen) {
      return res.status(400).json({ valid: false, message: "Missing move data" });
    }

    const chess = new Chess(fen);
    const moveResult = chess.move({ from, to });

    if (!moveResult) {
      return res.status(400).json({
        valid: false,
        message: "Illegal move"
      });
    }

    res.json({
      valid: true,
      newFen: chess.fen(),
      move: moveResult
    });
  } catch (error) {
    console.error("Move validation error:", error);
    res.status(500).json({ valid: false, message: "Internal server error", error: error.message });
  }
});

// Get game state for spectators
app.get("/game/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // First check in-memory games
    const game = games.get(gameId);
    if (game) {
      return res.json({
        success: true,
        game: game.toRedisObject()
      });
    }

    // Check Redis
    const gameData = await redisClient.hGetAll(`game:${gameId}`);
    if (Object.keys(gameData).length === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    res.json({
      success: true,
      game: gameData
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get all active games for spectators
app.get("/games/active", async (req, res) => {
  try {
    const keys = await redisClient.keys('game:*');
    const activeGames = [];

    for (const key of keys) {
      const gameData = await redisClient.hGetAll(key);
      if (gameData.status === 'active') {
        activeGames.push({
          id: gameData.id,
          players: JSON.parse(gameData.players),
          turn: gameData.turn,
          moveCount: JSON.parse(gameData.moveHistory).length,
          startTime: parseInt(gameData.startTime)
        });
      }
    }

    res.json({
      success: true,
      games: activeGames
    });
  } catch (error) {
    console.error("Error fetching active games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// WebSocket endpoint for spectators
app.get("/spectate/:gameId", (req, res) => {
  res.json({
    success: true,
    message: "Connect to socket.io and join room 'spectate:" + req.params.gameId + "' to spectate this game"
  });
});

// Redis subscriber for game updates (for spectators)
redisSub.subscribe('gameUpdate', (message) => {
  try {
    const data = JSON.parse(message);
    io.to(`spectate:${data.gameId}`).emit('gameUpdate', data.state);
  } catch (error) {
    console.error('Error handling Redis message:', error);
  }
});

// Cleanup function for expired games
async function cleanupExpiredGames() {
  try {
    const keys = await redisClient.keys('game:*');
    const now = Date.now();
    
    for (const key of keys) {
      const gameData = await redisClient.hGetAll(key);
      const lastMoveTime = parseInt(gameData.lastMoveTime) || 0;
      
      // Remove games inactive for more than 1 hour
      if (now - lastMoveTime > 3600000) {
        await redisClient.del(key);
        console.log(`Cleaned up expired game: ${gameData.id}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired games:', error);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredGames, 600000);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Redis connection: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
});