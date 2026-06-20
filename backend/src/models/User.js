const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false, // sensitive — keep off queries
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// ── Instance methods ───────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.addRefreshToken = function (token) {
  this.refreshTokens.push(token);
  // Keep only the last 5 refresh tokens per device family
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
};

userSchema.methods.clearRefreshTokens = function () {
  this.refreshTokens = [];
};

const User = mongoose.model('User', userSchema);
module.exports = User;
