DEEPLOYED WEBSITE LINK : https://chess-master-beta.vercel.app/
A full-stack real-time multiplayer chess platform built with React, Node.js, and MongoDB, featuring:

🔄 Live PvP chess gameplay

🏁 Game end logic (resign, draw, checkmate, timer)

👁️ Spectator mode with Pub/Sub architecture using Redis

🏆 Leaderboard & Player profiles

🔐 User authentication with signup & login


🚀 FEATURES


♟ Gameplay
Real-time 1v1 chess using react-chessboard + chess.js

Turn-based logic with move validation

Timer countdown with auto-loss on timeout

Draw offers, resigns, and checkmate detection

🧑‍🤝‍🧑 Multiplayer & Spectator Support
Socket-based game rooms (1v1)

Spectator view via Redis Pub/Sub for efficient message broadcasting

Optimized Redis channels for scalability

📈 Leaderboard & Profiles
ELO-style ranking system (optional)

User profile pages with match history and stats

🔐 Authentication
Signup / Login with JWT or session-based auth

Secure password handling via bcrypt
