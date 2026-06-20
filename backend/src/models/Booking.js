const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Seats booked is required'],
      min: [1, 'Must book at least 1 seat'],
      max: [10, 'Cannot book more than 10 seats at once'],
      validate: {
        validator: Number.isInteger,
        message: 'Seats must be a whole number',
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
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
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ userId: 1, eventId: 1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ status: 1 });

// ── Pre-save hook: generate booking reference ─────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingReference) {
    this.bookingReference = 'BK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
