const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  playerName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  hashedPassword: {
    type: String,
    required: true,
    // minlength: 6
  },
  gamesWon: {
    type: Number,
    default: 0,
    min: 0
  },
  gamesLost: {
    type: Number,
    default: 0,
    min: 0
  },
  gamesDrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  playerRating: {
    type: Number,
    default: 1200, // Standard starting rating
    min: 100,
    max: 3000
  },
  // Additional useful fields
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  totalGames: {
    type: Number,
    default: 0
  },
  winRate: {
    type: Number,
    default: 0
  },
  preferredTimeControl: {
    type: String,
    enum: ['blitz', 'rapid', 'classical'],
    default: 'rapid'
  },
  avatar: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update calculated fields before saving
userSchema.pre('save', function(next) {
  this.totalGames = this.gamesWon + this.gamesLost + this.gamesDrawn;
  this.winRate = this.totalGames > 0 ? (this.gamesWon / this.totalGames * 100) : 0;
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Update game stats method
userSchema.methods.updateGameStats = function(result, opponentRating) {
  if (result === 'win') {
    this.gamesWon += 1;
    this.playerRating += this.calculateRatingChange(opponentRating, 1);
  } else if (result === 'loss') {
    this.gamesLost += 1;
    this.playerRating += this.calculateRatingChange(opponentRating, 0);
  } else if (result === 'draw') {
    this.gamesDrawn += 1;
    this.playerRating += this.calculateRatingChange(opponentRating, 0.5);
  }
  
  // Ensure rating doesn't go below 100
  this.playerRating = Math.max(100, this.playerRating);
};

// Simple ELO rating calculation
userSchema.methods.calculateRatingChange = function(opponentRating, score) {
  const K = 32; // K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - this.playerRating) / 400));
  return Math.round(K * (score - expectedScore));
};

// Hide sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.hashedPassword;
  return user;
};

module.exports = mongoose.model('User', userSchema);