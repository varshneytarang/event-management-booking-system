const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      minlength: [3, 'Event name must be at least 3 characters'],
      maxlength: [200, 'Event name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      maxlength: [300, 'Venue cannot exceed 300 characters'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time is required'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Total seats must be a whole number',
      },
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Available seats must be a whole number',
      },
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      enum: ['Technology', 'Design', 'Business', 'Community', 'Music', 'Sports', 'General'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
eventSchema.index({ dateTime: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
// Compound text index for search
eventSchema.index({ name: 'text', description: 'text', venue: 'text' });

// ── Virtual ────────────────────────────────────────────────────────────────────
eventSchema.virtual('isSoldOut').get(function () {
  return this.availableSeats === 0;
});

eventSchema.virtual('occupancyPercent').get(function () {
  if (this.totalSeats === 0) return 100;
  return Math.round(((this.totalSeats - this.availableSeats) / this.totalSeats) * 100);
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
