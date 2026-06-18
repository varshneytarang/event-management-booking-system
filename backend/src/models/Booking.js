const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seatsBooked: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Must book at least 1 seat' },
      max: { args: [10], msg: 'Cannot book more than 10 seats at once' },
    },
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled'),
    defaultValue: 'confirmed',
  },
  bookingReference: {
    type: DataTypes.STRING,
    unique: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Booking;
