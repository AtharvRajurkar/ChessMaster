
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const socketIo = require('socket.io')
const { Chess } = require('chess.js') // DIRECTLY use chess.js

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

const port = process.env.PORT || 5000

let waitingPlayers = [];
let games = new Map();

function generateGameId() {
  return Math.random().toString(36).slice(2, 11).padEnd(9, '0');
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinMatchmaking', () => {
    if (waitingPlayers.length > 0) {
      const waitingPlayer = waitingPlayers.shift();
      const gameId = generateGameId();

      // First player = white, second player = black
      const game = {
        id: gameId,
        players: {
          white: waitingPlayer.id,
          black: socket.id
        },
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        turn: "w",
        status: "active",
        moveHistory: [],
        lastMoveTimestamp: Date.now()
      };

      games.set(gameId, game);

      waitingPlayer.socket.join(gameId);
      socket.join(gameId);

      // Notify players
      waitingPlayer.socket.emit('gameFound', {
        gameId: gameId,
        playerColor: 'w',
        opponent: socket.id
      });

      socket.emit('gameFound', {
        gameId: gameId,
        playerColor: 'b',
        opponent: waitingPlayer.id
      });

    } else {
      waitingPlayers.push({
        id: socket.id,
        socket: socket
      });
      socket.emit('waitingForPlayer');
    }
  });

  socket.on('makeMove', (data) => {
    try {
      const { gameId, from, to } = data;
      const game = games.get(gameId);

      if (game && game.status === 'active') {
        const isWhitePlayer = game.players.white === socket.id;
        const isBlackPlayer = game.players.black === socket.id;
        const canMove = (game.turn === 'w' && isWhitePlayer) ||
                        (game.turn === 'b' && isBlackPlayer);

        if (canMove) {
          const chess = new Chess(game.fen);
          const moveResult = chess.move({ from, to });

          if (moveResult) {
            // Valid move
            game.turn = chess.turn();
            game.fen = chess.fen();
            game.moveHistory.push(`${from}-${to}`);
            game.lastMoveTimestamp = Date.now();

            io.to(gameId).emit('gameMove', {
              from,
              to,
              newFen: game.fen,
              turn: game.turn,
              move: `${from}-${to}`,
              moveHistory: game.moveHistory
            });
          } else {
            // Invalid move, notify player
            socket.emit('invalidMove', {
              reason: 'Illegal move'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling move:', error);
      socket.emit('serverError', {
        message: 'Internal server error'
      });
    }
  });

  socket.on('endGame', (data) => {
    const { gameId, result } = data;
    const game = games.get(gameId);

    if (game) {
      game.status = 'ended';
      io.to(gameId).emit('gameEnd', { result });
      games.delete(gameId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove from waiting queue if present
    waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);

    // Check active games
    for (let [gameId, game] of games) {
      if (game.players.white === socket.id || game.players.black === socket.id) {
        const opponentId = game.players.white === socket.id ?
                           game.players.black : game.players.white;

        io.to(opponentId).emit('gameEnd', { result: 'opponent_disconnected' });
        games.delete(gameId);
      }
    }
  });
});

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

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




